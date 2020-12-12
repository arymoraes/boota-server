import mongoose from 'mongoose';

export interface QuestionRaw {
  title: string,
  stem: string,
  category: string,
  options: string[],
  correct: number,
  ownership: string,
  done?: boolean,
  difficulty?: string,
  uuid: string
}

export interface Question extends QuestionRaw {
  _id: string,
}

const questionSchema: mongoose.Schema<QuestionRaw> = new mongoose.Schema({
  title: String,
  stem: String,
  category: String,
  options: [String],
  correct: Number,
  ownership: String,
  done: Boolean,
  difficulty: String,
  uuid: String,
});

export default mongoose.model('Question', questionSchema);
