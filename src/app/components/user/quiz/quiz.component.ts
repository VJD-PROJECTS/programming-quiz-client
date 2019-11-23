import { Component, OnInit } from '@angular/core';
import { QuesViewMode, QuizEntry } from 'src/app/models';
import { QuizService, AuthService, ApiService } from 'src/app/services';
import { Subscription } from 'rxjs/internal/Subscription';
import { questionsEntry } from 'src/app/Utility';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  QuesViewMode = QuesViewMode;
  viewMode: QuesViewMode;
  currentQuestion: number;
  totalQuestions: number;
  showSubmitBtn = false;
  questionNumberList: number[];
  scoreSubscription: Subscription;
  scorecard: string;

  constructor(
    private quiz: QuizService,
    private auth: AuthService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.viewMode = QuesViewMode.INSTRUCTIONS;
  }

  startQuiz(): void {
    this.totalQuestions = this.quiz.getTotalQuestions();
    this.updateQuizDetails(1);
    this.questionNumberList = [];
    for (let i = 1; i <= this.totalQuestions; i++) {
      this.questionNumberList.push(i);
    }
    this.viewMode = QuesViewMode.QUESTIONS;
  }

  onQSelect(num: number): void {
    this.updateQuizDetails(num);
  }

  updateQuizDetails(num: number): void {
    this.currentQuestion = num;
    this.quiz.onQuestionSelect.next(num - 1);
    if (num === this.totalQuestions) {
      this.showSubmitBtn = true;
    }
  }

  onSelect($event): void {
    this.quiz.updateSelectedAnswers($event);
  }

  nextQuestion(): void {
    this.updateQuizDetails((this.currentQuestion += 1));
  }

  submitQuiz(): void {
    this.showSubmitBtn = false;
    const questions = this.quiz.getQuestions();
    const SelectedLanguage = this.quiz.getSelectedLanguage();
    const userDetails = this.auth.getUserDetails();
    const quizEntry: QuizEntry = {
      ...userDetails,
      SelectedLanguage,
      QuestionEntry: questionsEntry(questions)
    };
    this.api.insertUserQuiz(quizEntry).then((score: string) => {
      this.scorecard = score;
      this.viewMode = QuesViewMode.END;
      // this.auth.resetAll();
    }).catch(error => console.log(error));
  }
}