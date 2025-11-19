"use client";

import { useState } from "react";
import { Asset } from "@/lib/mockData";

interface DataInspectorProps {
  asset: Asset;
}

const DataInspector = ({ asset }: DataInspectorProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "schema" | "sample">("preview");

  // Mock data
  const mockPreviewData = [
    ["Date", "Temperature", "Humidity", "Pressure", "Wind Speed"],
    ["2024-01-01", "15.2°C", "65%", "1013 hPa", "12 km/h"],
    ["2024-01-02", "16.8°C", "58%", "1015 hPa", "8 km/h"],
    ["2024-01-03", "14.5°C", "72%", "1010 hPa", "15 km/h"],
    ["...more rows available after purchase", "...", "...", "...", "..."],
  ];

  const mockSchema = [
    { field: "date", type: "DateTime", description: "Observation date" },
    { field: "temperature", type: "Float", description: "Temperature in Celsius" },
    { field: "humidity", type: "Integer", description: "Relative humidity %" },
    { field: "pressure", type: "Float", description: "Atmospheric pressure in hPa" },
    { field: "wind_speed", type: "Float", description: "Wind speed in km/h" },
  ];

  const mockSampleCode = `{
  "date": "2024-01-01T00:00:00Z",
  "temperature": 15.2,
  "humidity": 65,
  "pressure": 1013.5,
  "wind_speed": 12.3,
  "location": {
    "lat": 40.7128,
    "lon": -74.0060,
    "city": "New York"
  }
}`;

  return (
    <div className="glass-card p-8 reveal delay-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-sans font-bold text-white flex items-center gap-2">
          <i data-lucide="eye" className="w-6 h-6 text-yuzu"></i>
          Data Inspector
        </h2>

        {!asset.sampleAvailable && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-pending/10 border border-pending/30 rounded-lg">
            <i data-lucide="lock" className="w-4 h-4 text-pending"></i>
            <span className="font-mono text-xs text-pending">
              Purchase required for full access
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 font-mono text-sm transition-all border-b-2 ${
            activeTab === "preview"
              ? "border-yuzu text-yuzu"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <i data-lucide="table" className="w-4 h-4 inline mr-2"></i>
          Preview
        </button>
        <button
          onClick={() => setActiveTab("schema")}
          className={`px-4 py-2 font-mono text-sm transition-all border-b-2 ${
            activeTab === "schema"
              ? "border-yuzu text-yuzu"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <i data-lucide="list" className="w-4 h-4 inline mr-2"></i>
          Schema
        </button>
        <button
          onClick={() => setActiveTab("sample")}
          className={`px-4 py-2 font-mono text-sm transition-all border-b-2 ${
            activeTab === "sample"
              ? "border-yuzu text-yuzu"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <i data-lucide="code" className="w-4 h-4 inline mr-2"></i>
          Sample
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "preview" && (
        <div className="overflow-x-auto">
          <div className="relative">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {mockPreviewData[0].map((header, i) => (
                    <th
                      key={i}
                      className="text-left py-3 px-4 text-xs text-gray-400 font-bold tracking-wide"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockPreviewData.slice(1).map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      i === mockPreviewData.length - 2 ? "opacity-40 blur-[2px]" : ""
                    }`}
                  >
                    {row.map((cell, j) => (
                      <td key={j} className="py-3 px-4 text-gray-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {!asset.sampleAvailable && (
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void via-void/80 to-transparent flex items-end justify-center pb-4">
                <button className="px-6 py-3 bg-yuzu text-black rounded-lg font-mono text-sm font-bold hover:bg-yuzu-light transition-all shadow-[0_0_20px_rgba(255,159,28,0.4)]">
                  <i data-lucide="unlock" className="w-4 h-4 inline mr-2"></i>
                  Purchase to View Full Data
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "schema" && (
        <div className="space-y-3">
          {mockSchema.map((field, i) => (
            <div
              key={i}
              className="p-4 glass-input rounded-lg hover:border-yuzu/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-white">
                      {field.field}
                    </span>
                    <span className="px-2 py-0.5 bg-hydro/10 border border-hydro/30 rounded text-xs font-mono text-hydro">
                      {field.type}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    {field.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sample" && (
        <div className="relative">
          <pre className="p-4 glass-input rounded-lg overflow-x-auto">
            <code className="font-mono text-sm text-gray-300">{mockSampleCode}</code>
          </pre>

          <button className="absolute top-4 right-4 p-2 glass-input rounded-lg hover:border-yuzu/50 transition-all group">
            <i data-lucide="copy" className="w-4 h-4 text-gray-400 group-hover:text-yuzu"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default DataInspector;
