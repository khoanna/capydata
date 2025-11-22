import { PublishFormData } from "./PublishWizard";
import { Input, TextArea } from "@/components/Common/Input";
import TagDropdown from "@/components/Common/TagDropdown";
import { AVAILABLE_TAGS } from "@/lib/constants";

import { Heading } from "lucide-react";


interface MetadataStepProps {
  formData: PublishFormData;
  updateFormData: (updates: Partial<PublishFormData>) => void;
  onTagDropdownOpenChange?: (isOpen: boolean) => void;
}

const MetadataStep = ({ formData, updateFormData, onTagDropdownOpenChange }: MetadataStepProps) => {
  // Get all available tags from marketplace

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
      />

      <TextArea
        label="Description *"
        placeholder="Describe your dataset in detail. What does it contain? How was it collected? What can it be used for?"
        value={formData.description}
        onChange={(e) => updateFormData({ description: e.target.value })}
        hint={`${formData.description.length}/1000 characters`}
        className="min-h-[150px]"
      />

      {/* Tags with Searchable Dropdown */}
      <TagDropdown
        selectedTags={formData.tags}
        onTagsChange={(tags) => updateFormData({ tags })}
        availableTags={AVAILABLE_TAGS}
        label="Tags *"
        hint="Select from marketplace tags or create custom ones"
        placeholder="Search or add tags..."
        onOpenChange={onTagDropdownOpenChange}
      />
    </div>
  );
};

export default MetadataStep;
