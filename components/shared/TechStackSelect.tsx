"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Common tech stack options that can be suggested
export const popularTechStack = [
  // Frontend Frameworks & Libraries
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Svelte",
  "Nuxt.js",
  "SvelteKit",
  "Solid.js",
  "Preact",
  "Ember.js",
  "Alpine.js",
  "Lit",
  "Astro",
  "Qwik",

  // Backend Frameworks & Runtime
  "Node.js",
  "Express",
  "NestJS",
  "Fastify",
  "Koa",
  "Hapi",
  "Django",
  "Flask",
  "FastAPI",
  "Ruby on Rails",
  "Laravel",
  "Symfony",
  "Spring Boot",
  "ASP.NET Core",
  "Phoenix",
  "Gin",
  "Echo",
  "Fiber",
  "Actix",
  "Rocket",
  "Axum",
  "Deno",
  "Bun",

  // No-Code/Low-Code
  "Bubble.io",
  "Webflow",
  "Wix",
  "Shopify",
  "WordPress",
  "Squarespace",
  "Framer",
  "Retool",
  "Airtable",
  "Notion",
  "AppSheet",
  "Adalo",

  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Ruby",
  "PHP",
  "Java",
  "Kotlin",
  "Swift",
  "Go",
  "Rust",
  "C",
  "C++",
  "C#",
  "Objective-C",
  "Dart",
  "Scala",
  "Clojure",
  "Elixir",
  "Erlang",
  "Haskell",
  "F#",
  "R",
  "Julia",
  "Lua",
  "Perl",
  "COBOL",
  "Fortran",
  "Assembly",
  "Groovy",
  "Bash",
  "PowerShell",
  "Zig",
  "Crystal",
  "Nim",
  "OCaml",
  "Prolog",

  // Databases
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "MariaDB",
  "SQLite",
  "Oracle",
  "SQL Server",
  "Redis",
  "Cassandra",
  "DynamoDB",
  "Elasticsearch",
  "Neo4j",
  "CouchDB",
  "Firebase",
  "Supabase",
  "PlanetScale",
  "Fauna",
  "Cockroach DB",
  "InfluxDB",
  "TimescaleDB",
  "Snowflake",
  "BigQuery",

  // CSS Frameworks & UI Libraries
  "Tailwind CSS",
  "Bootstrap",
  "Material UI",
  "Chakra UI",
  "Ant Design",
  "Bulma",
  "Foundation",
  "Semantic UI",
  "Styled Components",
  "Emotion",
  "Sass/SCSS",
  "Less",
  "Radix UI",
  "Shadcn UI",
  "DaisyUI",
  "Mantine",
  "PrimeReact",
  "Vuetify",
  "Quasar",

  // Cloud & Deployment
  "AWS",
  "Azure",
  "Google Cloud",
  "Vercel",
  "Netlify",
  "Heroku",
  "DigitalOcean",
  "Cloudflare",
  "Render",
  "Railway",
  "Fly.io",
  "Firebase Hosting",

  // DevOps & Infrastructure
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "GitHub Actions",
  "GitLab CI/CD",
  "CircleCI",
  "Travis CI",
  "Pulumi",
  "Prometheus",
  "Grafana",

  // Mobile Development
  "React Native",
  "Flutter",
  "Ionic",
  "SwiftUI",
  "Kotlin Multiplatform",
  "Xamarin",
  "Capacitor",
  "NativeScript",

  // Game Development
  "Unity",
  "Unreal Engine",
  "Godot",
  "Phaser",
  "Three.js",
  "PlayCanvas",
  "Babylon.js",

  // AI & ML
  "TensorFlow",
  "PyTorch",
  "scikit-learn",
  "Keras",
  "Hugging Face",
  "OpenAI API",
  "LangChain",
  "Mistral AI",
  "Ollama",
  "NVIDIA CUDA",
  "JAX",
  "ONNX",
  "MLflow",
  "DVC",
  "Weights & Biases",
  "Ray",
  "Spark MLlib",
  "spaCy",
  "Pandas",
  "NumPy",
  "Matplotlib",
  "Seaborn",
  "Plotly",
  "Gradio",
  "Streamlit",
  "FastAI",
  "AutoML",
  "H2O.ai",
  "DataRobot",
  "Vertex AI",
  "SageMaker",
  "Azure ML",
  "TensorRT",
  "CoreML",
  "TensorFlow.js",
  "ONNX Runtime",

  // Blockchain
  "Solidity",
  "Web3.js",
  "Ethers.js",
  "Hardhat",
  "Truffle",
  "Foundry",
  "Rust/Anchor",
];

// Create a master list of all allowed technologies
const getAllowedTechnologies = (platformSuggestions?: string[]) => {
  const allTechnologies = new Set([...popularTechStack]);

  // Add platform-specific suggestions if they exist
  if (platformSuggestions && platformSuggestions.length > 0) {
    platformSuggestions.forEach((tech) => allTechnologies.add(tech));
  }

  return Array.from(allTechnologies);
};

interface TechStackSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  error?: string;
  platformSuggestions?: string[];
  label?: string;
}

export function TechStackSelect({
  value,
  onChange,
  required = false,
  error,
  platformSuggestions,
  label = "Tech Stack",
}: TechStackSelectProps) {
  const [techStackInput, setTechStackInput] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get the complete list of allowed technologies (memoized to prevent infinite renders)
  const allowedTechnologies = useMemo(
    () => getAllowedTechnologies(platformSuggestions),
    [platformSuggestions]
  );

  // Filter options based on input
  useEffect(() => {
    if (techStackInput.trim() === "") {
      setFilteredOptions([]);
      return;
    }

    const filtered = allowedTechnologies.filter(
      (tech) =>
        tech.toLowerCase().includes(techStackInput.toLowerCase()) &&
        !value.includes(tech)
    );

    setFilteredOptions(filtered);
    setIsDropdownOpen(filtered.length > 0);
    setFocusedOptionIndex(-1);
  }, [techStackInput, value, allowedTechnologies]);

  // Handle tech stack selection
  const addTechStack = (tech: string) => {
    // Only add if it's in the allowed list
    if (!value.includes(tech) && allowedTechnologies.includes(tech)) {
      const newTechStack = [...value, tech];
      onChange(newTechStack);
      setTechStackInput("");
      setIsDropdownOpen(false);
    }
  };

  const removeTechStack = (tech: string) => {
    const newTechStack = value.filter((t) => t !== tech);
    onChange(newTechStack);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedOptionIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedOptionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        focusedOptionIndex >= 0 &&
        focusedOptionIndex < filteredOptions.length
      ) {
        addTechStack(filteredOptions[focusedOptionIndex]);
      } else if (filteredOptions.length === 1) {
        // If there's only one option, select it automatically
        addTechStack(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <Label htmlFor="techStack" className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tech) => (
          <Badge
            key={tech}
            variant="secondary"
            className="flex items-center gap-1 bg-gray-100"
          >
            {tech}
            <button
              type="button"
              onClick={() => removeTechStack(tech)}
              className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            id="techStack"
            placeholder="Search for technologies..."
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (techStackInput.trim() !== "" && filteredOptions.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            className={`${error ? "border-red-500" : ""}`}
            autoComplete="off"
          />
        </div>

        {/* Dropdown for filtered options */}
        {isDropdownOpen && filteredOptions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            <ul className="py-1">
              {filteredOptions.map((option, index) => (
                <li
                  key={option}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === focusedOptionIndex ? "bg-gray-100" : ""
                  }`}
                  onClick={() => addTechStack(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Platform-specific suggestions */}
      {platformSuggestions && platformSuggestions.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium mb-2">Suggested technologies:</p>
          <div className="flex flex-wrap gap-2">
            {platformSuggestions.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => addTechStack(tech)}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Popular technologies */}
      <div className="mt-2">
        <p className="text-sm font-medium mb-2">Popular technologies:</p>
        <div className="flex flex-wrap gap-2">
          {popularTechStack.slice(0, 6).map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => addTechStack(tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
