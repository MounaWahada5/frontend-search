import { Textarea } from "../ui/textarea";
import { cx } from "classix";
import { Button } from "../ui/button";
import { ArrowUpIcon } from "./icons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";

interface ChatInputProps {
  question: string;
  setQuestion: (question: string) => void;
  onSubmit: (text: string, webSearch?: boolean) => void;
  isLoading: boolean;
  isCompanyUser: boolean; // 👈 reçu du parent
}

const suggestedActions = [
  { title: "How is the weather", label: "in Vienna?", action: "How is the weather in Vienna today?" },
  { title: "Tell me a fun fact", label: "about pandas", action: "Tell me an interesting fact about pandas" },
];

export const ChatInput = ({
  question,
  setQuestion,
  onSubmit,
  isLoading,
  isCompanyUser,
}: ChatInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSubmit = (text?: string, webSearch = false) => {
    if (isLoading) {
      toast.error("Please wait for the model to finish its response!");
      return;
    }
    const payload = (text ?? question).trim();
    if (!payload) {
      toast.error("Please enter a question.");
      return;
    }
    setShowSuggestions(false);
    onSubmit(payload, webSearch);
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {showSuggestions && (
        <div className="hidden md:grid sm:grid-cols-2 gap-2 w-full">
          {suggestedActions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={i > 1 ? "hidden sm:block" : "block"}
            >
              <Button
                variant="ghost"
                onClick={() => handleSubmit(s.action, false)}
                className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 sm:flex-col w-full h-auto justify-start items-start"
              >
                <span className="font-medium">{s.title}</span>
                <span className="text-muted-foreground">{s.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      <Textarea
        placeholder="Send a message..."
        className={cx(
          "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl text-base bg-muted"
        )}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(question, false); // envoi normal
          }
        }}
        rows={3}
        autoFocus
      />

      {/* 🌐 Bouton Web Search — caché pour comptes company */}
      {!isCompanyUser && (
        <Button
          type="button"
          variant="outline"
          className="rounded-full p-1.5 h-fit absolute bottom-2 right-10 m-0.5 border dark:border-zinc-600"
          onClick={() => {
            if (!question.trim()) {
              toast.error("Type your question before searching the web.");
              return;
            }
            onSubmit(question, true); // web_search = true
          }}
          disabled={isLoading} // ne pas bloquer si champ vide; on gère au-dessus
          title="Search on the web"
        >
          🌐
        </Button>
      )}

      {/* Send */}
      <Button
        type="button"
        className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 border dark:border-zinc-600"
        onClick={() => handleSubmit(question, false)}
        disabled={isLoading || !question.trim()}
        title="Send"
      >
        <ArrowUpIcon size={14} />
      </Button>
    </div>
  );
};
