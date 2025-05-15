import React from "react";
import { AiModel } from "@shared/schema";

interface ModelItemProps {
  model: AiModel;
}

const ModelItem: React.FC<ModelItemProps> = ({ model }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={`h-3 w-3 rounded-full ${
            model.active ? "bg-green-500" : "bg-gray-500"
          } mr-2`}
        ></div>
        <span className="text-sm">{model.name}</span>
      </div>
      <span className={`text-xs ${model.active ? "text-green-500" : "text-gray-400"}`}>
        {model.active ? "Active" : "Disabled"}
      </span>
    </div>
  );
};

export default ModelItem;
