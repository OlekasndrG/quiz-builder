type Question = {
  id: number;
  text: string;
  type: "BOOLEAN" | "INPUT" | "CHECKBOX";
  options?: MultipleChoiceOption;
  correctText?: string | undefined;
  correct?: Boolean | false;
  order: number;
};
type MultipleChoiceOption = {
  text: string;
  isCorrect: boolean | false;
};

export function QuestionRenderer({ q }: { q: Question }) {
  return (
    <div className="border rounded p-3 mb-3">
      <div className="font-medium mb-2">{q.text}</div>
      {q.type === "BOOLEAN" && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" disabled checked={!!q.correct || false} /> True
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" disabled checked={!q.correct || false} /> False
          </label>
        </div>
      )}
      {q.type === "INPUT" && <input className="input" placeholder={q.correctText} disabled />}
      {q.type === "CHECKBOX" && (
        <div className="flex flex-col gap-2">
          {q.options.map((opt: MultipleChoiceOption, idx: number) => (
            <label key={idx} className="flex items-center gap-2">
              <span>{opt.text}</span>
              <input type="checkbox" disabled checked={!!opt.isCorrect} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
