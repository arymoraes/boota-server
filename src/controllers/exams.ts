import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { Document } from 'mongoose';
import Exams, { ExamRaw } from '../models/exams';
import Questions, { Question } from '../models/question';
import { examScoreCalculator } from '../utils/utils';
import { AuthRequest } from './questions';

export const getExams = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const exams = await Exams.find({ ownership: req.user._id });
    res.status(200);
    res.send(exams);
  } catch (e) {
    console.error(`Error trying to GET: ${e}`);
  }
};

export const generateExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const newExamTitle = req.body.title;

    if (!newExamTitle) {
      res.status(400);
      res.send({
        error: 'You are missing one (or more) of the params!',
      });
      return;
    }
    const createdExam = await Exams.create<ExamRaw>({
      title: newExamTitle,
      questions: [],
      doneBy: [],
      ownership: req.user._id,
      submitted: false,
      hashedId: null,
    });
    console.log(`Added to database: ${JSON.stringify(createdExam)}`);
    res.send(createdExam);
  } catch (e) {
    console.error(`Error adding an event to the database: ${e}`);
  }
};

export const addQuestionToExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const currentExam: any = await Exams.findOne({ _id: req.body._id });
    currentExam.questions.push(req.body.questionId);

    const update = currentExam;
    const question = await Exams.findByIdAndUpdate(
      { _id: req.body._id },
      update,
    );
    res.status(200);
    res.send(question);
  } catch (err) {
    res.status(400);
  }
};

export const getSingleQuestion = async (questionId: string) => {
  try {
    const question = await Questions.findOne({ _id: questionId });
    // console.log(question);
    return question;
  } catch (err) {
    console.error(err);
  }
};

export const getFullExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const exam: any = (
      await Exams.findOne({ _id: req.params.examId })
    ).toObject();
    const fetchedQuestions = await Questions.find()
      .where('_id')
      .in(exam.questions);
    exam.questions = fetchedQuestions;
    res.status(200);
    res.send(exam);
  } catch (err) {
    res.status(400);
  }
};

export const deleteQuestionFromExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const exam: any = (
      await Exams.findOne({ _id: req.body.examId })
    ).toObject();
    console.log(exam.questions);
    exam.questions = exam.questions.filter(
      (question: Question) => question !== req.body.questionId,
    );
    const filteredExam: Document = await Exams.findByIdAndUpdate(
      { _id: req.body.examId },
      { questions: exam.questions },
    );
    res.status(200);
    res.send(filteredExam);
  } catch (error) {
    res.status(400);
  }
};

export const deleteAnExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { examId } = req.params;
    const deletedExam = await Exams.findByIdAndDelete({ _id: examId });
    res.status(200);
    res.send(deletedExam);
  } catch (err) {
    res.status(400);
  }
};

export const generateAnExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { examId } = req.body;
    const hashedId = uuidv4();
    const updatedExam = await Exams.findByIdAndUpdate(
      { _id: examId },
      { submitted: true, hashedId },
      { new: true }
    );
    console.log(updatedExam);
    res.status(200);
    res.send(updatedExam);
  } catch (err) {
    res.status(400);
  }
};

export const fetchExamByHashedId = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { examId } = req.body;
    const exam = (await Exams.findOne({ hashedId: examId })).toObject();

    exam.questions = await Promise.all(
      exam.questions.map(async (questionId: string) => {
        const question: any = await getSingleQuestion(questionId);
        console.log(question);
        const filteredQuestion = {
          options: question.options,
          stem: question.stem,
        };
        return filteredQuestion;
      }),
    );

    console.log(exam);
    if (!exam) throw new Error();
    res.status(200);
    res.send({
      title: exam.title,
      hashedId: exam.hashedId,
      options: exam.questions,
    });
  } catch (err) {
    res.status(400);
  }
};

export const studentFinishedExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const studentAnswers = req.body.answers;
    const questionsArray = req.body.questions;
    const examId = req.body.hashedId;

    const score = await examScoreCalculator(studentAnswers, questionsArray);
    const exam = (await Exams.findOne({ hashedId: examId })).toObject();

    exam.doneBy = [
      ...exam.doneBy,
      {
        studentId: req.user._id,
        studentEmail: req.user.username,
        score,
      },
    ];

    console.log(exam.doneBy);

    await Exams.findByIdAndUpdate({ _id: exam._id }, { doneBy: exam.doneBy });

    res.status(200);
    res.send({
      score,
    });
  } catch (err) {
    res.status(400);
  }
};

export const studentGetFullExam = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const examId = req.params.id;
    const exam = (await Exams.findOne({ hashedId: examId })).toObject();

    const fetchedQuestions = await Questions.find()
      .where('_id')
      .in(exam.questions);
    const filteredQuestions = fetchedQuestions.map((value: any) => ({
      _id: value.uuid,
      options: value.options,
      stem: value.stem,
    }));

    if (!exam) throw new Error();
    res.status(200);
    res.send({
      title: exam.title,
      hashedId: exam.hashedId,
      options: filteredQuestions,
    });
  } catch (err) {
    res.status(400);
  }
};
