import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

const defaultQuestions: QuizQuestion[] = [
  {
    question: "Which of the following is a core principle of this skill?",
    options: ["Maintainability", "Randomness", "Duplication", "Inefficiency"],
    correctIndex: 0
  },
  {
    question: "What is the best practice when encountering a critical error?",
    options: ["Ignore it", "Log and handle it", "Delete the file", "Restart the computer"],
    correctIndex: 1
  },
  {
    question: "Which tool is commonly used to version control work in this field?",
    options: ["Git", "MS Paint", "Calculator", "Notepad"],
    correctIndex: 0
  }
];

interface SkillQuizModalProps {
  skill: string;
  onClose: () => void;
  onPass: (skill: string) => void;
}

export default function SkillQuizModal({ skill, onClose, onPass }: SkillQuizModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [passed, setPassed] = useState(false);

  // In a real app, you would fetch questions specific to the skill
  const questions = defaultQuestions;

  const handleSelectOption = (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate score
      let correct = 0;
      newAnswers.forEach((ans, i) => {
        if (ans === questions[i].correctIndex) correct++;
      });
      
      const isPassed = correct >= 2; // Pass if 2/3 or better
      setPassed(isPassed);
      setIsFinished(true);

      if (isPassed) {
        onPass(skill);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Verify Skill: <span className="text-indigo-600 dark:text-indigo-400">{skill}</span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!isFinished ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span>Question {currentStep + 1} of {questions.length}</span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                  {questions[currentStep].question}
                </h3>

                <div className="space-y-3">
                  {questions[currentStep].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
                      className="w-full p-4 text-left border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              {passed ? (
                <>
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Passed!</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You have successfully demonstrated your knowledge of {skill}.
                  </p>
                  <button onClick={onClose} className="mt-8 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Not Quite Right</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You didn't pass the verification for {skill} this time. Review your knowledge and try again later.
                  </p>
                  <button onClick={onClose} className="mt-8 w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Close
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
