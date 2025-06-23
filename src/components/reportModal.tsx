import React, { useState, useEffect } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const reasons = [
  "Hate speech",
  "Verbal abuse",
  "Inappropriate name",
  "Sexual content",
  "Spam or misleading",
  "Other",
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetId: string;
  type: "event" | "comment";
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, targetId, type }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setReason("");
      setDetails("");
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        targetId,
        reason,
        extra: details,
      };

      const res = await api.post("/api/report", payload);
      console.log("✅ Report sent:", res);

      toast.success("Report submitted successfully.");
      onClose();
    } catch (err: any) {
      console.error("❌ Report failed:", err);
      const message =
        err?.response?.data?.message || err.message || "Unknown error";
      toast.error("Failed to send report: " + message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 dark:text-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold">Report {type}</h2>

        <div className="space-y-1">
          {reasons.map((r) => (
            <label key={r} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}
        </div>

        <textarea
          className="w-full mt-2 p-2 border rounded bg-gray-50 text-sm"
          placeholder="Optional details..."
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !reason}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
