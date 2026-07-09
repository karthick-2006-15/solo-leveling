import React from 'react';
import { motion } from 'framer-motion';
import { useAcademics } from '../hooks/useAcademics';

const AcademicDashboard: React.FC = () => {
  const { profile, isLoading } = useAcademics();

  if (isLoading) return <div className="p-6 text-purple-400">Loading Academic Intel...</div>;

  return (
    <div className="w-full pb-32">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wider">ACADEMIC <span className="text-purple-500">INTELLIGENCE</span></h1>
          <p className="text-slate-400">Track your semester progress, attendance, and CGPA.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Semester</h3>
            <p className="text-2xl font-bold text-purple-400">{profile?.currentSemester || 1}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">CGPA</h3>
            <p className="text-2xl font-bold text-green-400">{profile?.cgpa?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Pending Assignments</h3>
            <p className="text-2xl font-bold text-amber-400">{profile?.assignmentsPending || 0}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-lg">
            <h3 className="text-slate-400 font-semibold mb-1 text-sm uppercase">Upcoming Exams</h3>
            <p className="text-2xl font-bold text-red-400">{profile?.examsUpcoming || 0}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Subjects Overview</h2>
          {profile?.subjects?.length ? (
            <div className="space-y-4">
              {profile.subjects.map((sub: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-slate-900 p-4 rounded border border-slate-700">
                  <span className="text-white font-medium">{sub.name}</span>
                  <span className="text-blue-400">{sub.attendancePercentage}% Attendance</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-500">No subjects tracked yet. Ask ARIA to add subjects for this semester.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AcademicDashboard;
