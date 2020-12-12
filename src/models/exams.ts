import mongoose from 'mongoose';

interface SingleExam {
  studentId: string,
  studentEmail: string,
  score: number
}

export interface ExamRaw {
  title: string,
  questions: string[],
  ownership: string,
  doneBy: SingleExam[],
  submitted: boolean,
  hashedId: string | null
}

export interface Exam {
  _id: string,
  title: string,
  questions: string[],
  ownership: string,
  doneBy: SingleExam[],
  submitted: boolean,
  hashedId?: string
}

const examSchema: mongoose.Schema<Exam> = new mongoose.Schema({
  title: String,
  questions: [String],
  ownership: String,
  doneBy: [{
    studentId: String,
    studentEmail: String,
    score: Number,
  }],
  submitted: Boolean,
  hashedId: String,
});

export default mongoose.model('Exam', examSchema);
