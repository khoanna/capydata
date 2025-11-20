import { PublishFormData } from "./PublishWizard";
import { Input, TextArea, Select } from "@/components/Common/Input";
import Badge from "@/components/Common/Badge";
import { useState } from "react";
import { Heading, Plus, Tag, User, X } from "lucide-react";

interface MetadataStepProps {
  formData: PublishFormData;
  updateFormData: (updates: Partial<PublishFormData>) => void;
}

const MetadataStep = ({ formData, updateFormData }: MetadataStepProps) => {
  const [tagInput, setTagInput] = useState("");

  const categories = [
    { value: "", label: "Select a category" },
    { value: "finance", label: "Finance & DeFi" },
    { value: "healthcare", label: "Healthcare & Medical" },
    { value: "climate", label: "Climate & Weather" },
    { value: "ai-ml", label: "AI & Machine Learning" },
    { value: "iot", label: "IoT & Sensors" },
    { value: "social", label: "Social Media" },
    { value: "transportation", label: "Transportation" },
    { value: "research", label: "Scientific Research" },
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData({ tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter((tag) => tag !== tagToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-bold text-white mb-2">
          Dataset Metadata
        </h2>
        <p className="font-mono text-sm text-gray-400">
          Provide essential information about your dataset to help buyers discover it.
        </p>
      </div>

      <Input
        label="Title *"
        placeholder="e.g., Global Weather Patterns 2024"
        value={formData.title}
        onChange={(e) => updateFormData({ title: e.target.value })}
        hint="Choose a clear, descriptive title"
        icon={<Heading className="w-4 h-4" />}
      />

      <TextArea
        label="Description *"
        placeholder="Describe your dataset in detail. What does it contain? How was it collected? What can it be used for?"
        value={formData.description}
        onChange={(e) => updateFormData({ description: e.target.value })}
        hint={`${formData.description.length}/1000 characters`}
        className="min-h-[150px]"
      />

      {/* Tags */}
      <div>
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          Tags
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            hint="Tags help buyers find your dataset"
            icon={<Tag className="w-4 h-4" />}
          />
          <button
            onClick={handleAddTag}
            className="px-4 py-3 glass-input rounded-lg hover:border-yuzu/50 transition-all flex items-center gap-2 font-mono text-sm text-white shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="type" size="md">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-error transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetadataStep;
