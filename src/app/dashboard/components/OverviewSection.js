import { useEffect } from "react";

const {
  Globe2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Timer,
} = require("lucide-react");

export function OverviewSection({ darkMode, userDoc, sessions }) {
  const totalSessions = sessions?.length || 0;
  const blockedCount = userDoc?.blockedDomains?.length || 0;

  const mostBlockedSite = userDoc?.blockedDomains?.[0] || "No sites yet";

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Focus sessions"
          value={`${totalSessions}`}
          subtitle="Total logged sessions"
          icon={Timer}
          accent="from-indigo-500 to-cyan-500"
          darkMode={darkMode}
        />
        <StatCard
          title="Blocked sites"
          value={`${blockedCount}`}
          subtitle="Domains in your block list"
          icon={Shield}
          accent="from-emerald-500 to-lime-500"
          darkMode={darkMode}
        />
        <StatCard
          title="Most blocked site"
          value={mostBlockedSite}
          subtitle={
            blockedCount ? "Based on your list" : "Add some sites first"
          }
          icon={Globe2}
          accent="from-amber-500 to-orange-500"
          darkMode={darkMode}
        />
        <StatCard
          title="Streak"
          value="5 days"
          subtitle="Daily focus streak"
          icon={CheckCircle2}
          accent="from-pink-500 to-rose-500"
          darkMode={darkMode}
        />
      </div>

      {/* Charts + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className={`
            lg:col-span-2 rounded-2xl p-4 sm:p-5 border
            ${
              darkMode
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">
                Focus trend (last 7 days)
              </h2>
              <p
                className={`text-xs ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Hours focused per day
              </p>
            </div>
            <span
              className={`
                text-[11px] px-2 py-1 rounded-full border
                ${
                  darkMode
                    ? "border-slate-700 text-slate-400"
                    : "border-slate-300 text-slate-500"
                }
              `}
            >
              Simple placeholder chart
            </span>
          </div>

          {/* Simple fake chart with bars */}
          <div className="mt-4 flex items-end gap-2 sm:gap-3 h-40">
            {[
              { day: "Mon", value: 30 },
              { day: "Tue", value: 50 },
              { day: "Wed", value: 80 },
              { day: "Thu", value: 40 },
              { day: "Fri", value: 60 },
              { day: "Sat", value: 20 },
              { day: "Sun", value: 70 },
            ].map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`
                    w-full rounded-t-xl bg-linear-to-t from-indigo-600 to-cyan-500
                    ${darkMode ? "" : ""}
                  `}
                  style={{ height: `${d.value}%` }}
                ></div>
                <span className="text-[11px] text-slate-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`
            rounded-2xl p-4 sm:p-5 border flex flex-col gap-3
            ${
              darkMode
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Today&apos;s activity</h2>
            <span
              className={`text-[11px] ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Live from extension
            </span>
          </div>

          <ul className="space-y-3 mt-1 text-xs">
            <ActivityItem
              darkMode={darkMode}
              status="blocked"
              title="Redirected from youtube.com"
              time="5 min ago"
            />
            <ActivityItem
              darkMode={darkMode}
              status="success"
              title="Completed 25-min focus session"
              time="32 min ago"
            />
            <ActivityItem
              darkMode={darkMode}
              status="warn"
              title="3 visits to instagram.com"
              time="1h ago"
            />
            <ActivityItem
              darkMode={darkMode}
              status="success"
              title="New domain added: twitter.com"
              time="2h ago"
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, accent, darkMode }) {
  return (
    <div
      className={`
        rounded-2xl p-4 border flex items-center gap-3
        ${
          darkMode
            ? "border-slate-800 bg-slate-900/60"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        className={`
          w-10 h-10 rounded-xl bg-linear-to-br ${accent}
          flex items-center justify-center text-white
        `}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p
          className={`text-xs ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {title}
        </p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        <p
          className={`text-[11px] mt-0.5 ${
            darkMode ? "text-slate-500" : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ActivityItem({ darkMode, status, title, time }) {
  const color =
    status === "blocked"
      ? "text-red-400"
      : status === "warn"
      ? "text-amber-400"
      : "text-emerald-400";

  const icon =
    status === "blocked" ? (
      <Shield className={`w-3.5 h-3.5 ${color}`} />
    ) : status === "warn" ? (
      <AlertTriangle className={`w-3.5 h-3.5 ${color}`} />
    ) : (
      <CheckCircle2 className={`w-3.5 h-3.5 ${color}`} />
    );

  return (
    <li className="flex items-start gap-2">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-[12px]">{title}</p>
        <p
          className={`text-[11px] mt-0.5 ${
            darkMode ? "text-slate-500" : "text-slate-500"
          }`}
        >
          {time}
        </p>
      </div>
    </li>
  );
}

/* -------- Focus Sessions -------- */

export function SessionsSection({ darkMode, sessions }) {
  const formatTime = (ts) => {
    if (!ts?.toDate) return "";
    return ts.toDate().toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Focus sessions</h2>
          <p
            className={`text-xs ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Track your recent focus intervals and performance.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-indigo-600 to-cyan-600 text-white shadow hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
        >
          Start new session
        </button>
      </div>

      <div
        className={`
          rounded-2xl border overflow-hidden text-xs
          ${
            darkMode
              ? "border-slate-800 bg-slate-900/60"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <div
          className={`
            grid grid-cols-4 gap-2 px-3 py-2 border-b text-[11px] font-semibold
            ${
              darkMode
                ? "border-slate-800 text-slate-300"
                : "border-slate-200 text-slate-600"
            }
          `}
        >
          <span>Session</span>
          <span>Duration</span>
          <span>Status</span>
          <span>Time</span>
        </div>
        <div>
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`
                grid grid-cols-4 gap-2 px-3 py-2.5 items-center
                ${darkMode ? "hover:bg-slate-800/70" : "hover:bg-slate-50"}
              `}
            >
              <span>{s.label}</span>
              <span>{s.duration}</span>
              <span>
                <span
                  className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
                    ${
                      s.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }
                  `}
                >
                  {s.status === "completed" ? "Completed" : "Cancelled"}
                </span>
              </span>
              <span className="text-slate-400">{formatTime(s.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------- Blocked Sites -------- */

/* -------- Settings -------- */
