"use client";

import { Shield, Timer, Brain, Puzzle, Target, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";

export default function AboutPage() {
  const [isDark, setIsDark] = useState(true);

  const projects = [
    {
      title: "PeriodCare – AI-Powered Menstrual Health Companion",
      techStack: [
        "Next.js",
        "React.js",
        "Tailwind CSS",
        "Gemini AI API",
        "Ollama (Local LLM)",
        "FastAPI (Optional Backend)",
      ],
      description:
        "An AI-driven menstrual health platform offering multi-language education, symptom guidance, personalized recommendations, myth-busting, partner mode support, and more to improve menstrual awareness and comfort.",
      github: "https://github.com/1900690105/periodcare",
      live: "https://periodcareforyou.vercel.app/",
    },

    {
      title: "Together, We Can Stop Food Waste",
      techStack: ["Next.js", "React.js", "Tailwind CSS", "Map API", "Firebase"],
      description:
        "Our platform aims to eliminate food wastage by bridging the gap between those who have surplus food and those in need — using technology for a better tomorrow.",
      github: "https://github.com/1900690105/ZeroWasteBite",
      live: "https://zerowastebite.vercel.app/",
    },

    {
      title: "Avsarmarg - Your Journey from Campus to Company Starts Here",
      techStack: [
        "React.js",
        "Next.js",
        "Firebase",
        "Gemini",
        "Tailwind CSS",
        "github",
        "Vercel+CI/CD",
        "monaco-editor",
        "Judge0 API",
        "cheerio",
        "Job Listing Fetch  API",
      ],
      description:
        "Personalized career paths, skills development,interview preparation and job opportunities tailored for students.",
      github: "#",
      live: "https://avsarmarg.vercel.app/",
    },
    {
      title: "File Xerox - Upload->Print->Pickup",
      techStack: [
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Vercel+CI/CD",
        "Cloudinary",
      ],
      description: `Revolutionary cloud printing that connects you to thousands of Xerox centers. No USB drives. No waiting.`,
      github: "https://github.com/1900690105/filexerox",
      live: "https://filexerox.vercel.app/",
    },
    {
      title: "BodhaBot - One Chatbot,Infinite Possibilities",
      techStack: [
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Gemini AI API",
        "Vercel+CI/CD",
      ],
      description:
        "Integrate intelligent conversations into your website by simply sharing your URL, JSON data, or PDF documents. Let AI handle the rest.",
      github: "#",
      live: "https://bodhabot.vercel.app/",
    },
    {
      title: "Modern College Website Using AI",
      techStack: [
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Gemini AI API",
        "MySql",
      ],
      description:
        "🎓 An interactive and responsive college website powered by AI — featuring smart chatbots for instant guidance, AI-generated content, and seamless navigation to help students explore their academic journey with ease.",
      github: "https://github.com/1900690105/GROUP_G1",
    },
    {
      title: "C-Rush 3.0 - Hackathon Event Website",
      techStack: [
        "React.js",
        "Nextsjs",
        "Gemini AI API",
        "Tailwind",
        "Vercel+CI/CD",
      ],
      description:
        "The Ultimate Programming Challenge by GCOEY Team event website. Solve mind-bending problems and prove your coding prowess!",
      github: "#",
      live: "https://c-rush.vercel.app/",
    },
    {
      title: "Find About State - City Information Finder",
      techStack: ["React", "NextJs", "Gemini AI API", "Tailwind"],
      description:
        "AI powered platform that help to find information about cities in any state and country with detailed information",
      github: "#",
      live: "https://findaboutstate.vercel.app/",
    },
  ];

  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          isDark
            ? "bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950"
            : "bg-linear-to-br from-slate-50 via-indigo-50 to-cyan-50"
        }`}
      >
        {/* Header */}
        <Header setIsDark={setIsDark} isDark={isDark} />

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center px-6 mt-10">
          <h2
            className={`text-4xl font-extrabold mb-3 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Take Control of Your Digital Habits
          </h2>
          <p
            className={`text-lg ${
              isDark ? "text-gray-400" : "text-gray-700"
            } max-w-2xl mx-auto`}
          >
            Niyambadha is your personal companion for better focus. Block
            distractions, set limits, unlock access through fun puzzles, and
            build a healthier digital routine—one session at a time.
          </p>
        </section>

        {/* Features Grid */}
        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 py-16">
          {/* Feature Card */}
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Smart Website Blocking"
            text="Block distracting websites or entire domains with one tap. Built for real productivity."
            isDark={isDark}
          />

          <FeatureCard
            icon={<Timer className="w-8 h-8" />}
            title="Timed Access Control"
            text="Set precise watch-time limits and auto-redirect when time runs out."
            isDark={isDark}
          />

          <FeatureCard
            icon={<Puzzle className="w-8 h-8" />}
            title="Puzzle Unlock System"
            text="Unlock extra screen time by solving quick, engaging puzzles."
            isDark={isDark}
          />

          <FeatureCard
            icon={<Brain className="w-8 h-8" />}
            title="Focus-Oriented Design"
            text="Built with cognitive-friendly UI to reduce noise and improve your workflow."
            isDark={isDark}
          />

          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Works Across Devices"
            text="Sync your settings across devices using your Niyambadha account."
            isDark={isDark}
          />

          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Build Better Habits"
            text="Stay consistent and build long-term discipline with guided control."
            isDark={isDark}
          />
        </section>

        {/* Mission Section */}
        <section
          className={`py-16 ${isDark ? "bg-slate-900/40" : "bg-white/80"}`}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2
              className={`text-3xl font-bold mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Our Mission
            </h2>
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-700"
              } leading-relaxed`}
            >
              Our mission is to help people regain control of their digital
              life. We believe technology should support productivity—not steal
              it. Niyambadha empowers users to stay focused, avoid distractions,
              and develop intentional online habits.
            </p>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Founder Image */}
            <div className="flex justify-center">
              <Image
                src="/founder.jpeg" // ⭐ replace with your image path
                alt="Founder"
                height={100}
                width={100}
                className="w-60 h-60 rounded-2xl object-cover shadow-xl border border-white/10"
              />
            </div>

            {/* Founder Text */}
            <div>
              <h2
                className={`text-3xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Meet the Founder
              </h2>

              <p
                className={`text-lg mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-700"
                }`}
              >
                <span className="font-semibold text-indigo-400">
                  {/* ⭐ Replace with your name */}
                  Nikhil Vitthal Kandhare
                </span>{" "}
                is the creator of Niyambadha — a vision born from the need to
                bring discipline, balance, and mindful usage into the digital
                world.
              </p>

              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-gray-400" : "text-gray-700"
                }`}
              >
                {/* ⭐ Replace with your personal intro */}
                Passionate about productivity and clean digital habits, they
                built Niyambadha to help people stay focused and avoid unhealthy
                distractions. With a strong background in web development and
                user behavior design, they continue to evolve the platform with
                one goal: empowering people to use technology intentionally.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-6">
                <Link
                  href="https://www.linkedin.com/in/nikhilkandhare/" // ⭐ Replace
                  className={`text-sm font-medium underline ${
                    isDark ? "text-cyan-400" : "text-indigo-600"
                  }`}
                >
                  LinkedIn
                </Link>

                <Link
                  href="https://github.com/1900690105" // ⭐ Replace
                  className={`text-sm font-medium underline ${
                    isDark ? "text-cyan-400" : "text-indigo-600"
                  }`}
                >
                  GitHub
                </Link>

                <Link
                  href="https://nikhilkandhare.vercel.app/" // ⭐ Replace
                  className={`text-sm font-medium underline ${
                    isDark ? "text-cyan-400" : "text-indigo-600"
                  }`}
                >
                  Portfolio
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= Projects Section ========================= */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2
              className={`text-3xl font-bold text-center mb-4 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              My Projects
            </h2>

            <p
              className={`text-center text-lg max-w-2xl mx-auto mb-12 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              A collection of products, experiments, and full-stack applications
              I&#39;ve built with passion, creativity, and modern technologies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 shadow-xl border transition-all hover:scale-[1.02] ${
                    isDark
                      ? "bg-slate-900/50 border-slate-800 hover:bg-slate-900"
                      : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-3 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {project.title}
                  </h3>

                  <p
                    className={`text-sm mb-4 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {project.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 text-xs rounded-full border ${
                          isDark
                            ? "border-slate-700 text-slate-300"
                            : "border-slate-300 text-slate-700"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-3 mt-auto">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        className={`px-4 py-2 text-xs font-semibold rounded-lg border ${
                          isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        GitHub
                      </a>
                    )}

                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8">
          <p
            className={`text-sm ${isDark ? "text-gray-500" : "text-gray-600"}`}
          >
            © {new Date().getFullYear()} Niyambadha. Built with ❤️ for better
            focus.
          </p>
        </footer>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, text, isDark }) {
  return (
    <div
      className={`p-6 rounded-2xl shadow-lg border ${
        isDark
          ? "bg-slate-900/60 border-slate-800 text-gray-200"
          : "bg-white border-slate-200 text-slate-800"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          isDark
            ? "bg-indigo-500/20 text-indigo-300"
            : "bg-indigo-100 text-indigo-700"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm">{text}</p>
    </div>
  );
}
