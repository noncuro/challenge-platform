import React, {useState} from "react";
import {Button} from "@/components/ui/Button";

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    challengeUrl: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({isOpen, onClose, challengeUrl}) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(challengeUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Challenge Created Successfully!</h2>
                <p className="mb-4">Your challenge URL:</p>
                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        value={challengeUrl}
                        readOnly
                        className="flex-grow border rounded-l px-2 py-1"
                    />
                    <button
                        onClick={copyToClipboard}
                        className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    );
};