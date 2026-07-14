import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Edit2, Check, Calendar, Award, 
  Code, ExternalLink, 
  GraduationCap, BrainCircuit, RefreshCw
} from 'lucide-react';
import { useAcademics } from '../hooks/useAcademics';
import { useSystemSound } from '../hooks/useSystemSound';
import { SystemWindow } from '../components/ui/SystemWindow';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line
} from 'recharts';

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

type ActiveTabType = 'hub' | 'subjects' | 'assignments' | 'exams' | 'projects' | 'coding' | 'calendar' | 'planner' | 'analytics';

const AcademicDashboard: React.FC = () => {
  const { profile, isLoading, updateProfile, completeTask } = useAcademics();
  const { play } = useSystemSound();
  const [activeTab, setActiveTab] = useState<ActiveTabType>('hub');
  
  // Active semester selection
  const [selectedSemester, setSelectedSemester] = useState<number>(profile?.currentSemester || 1);

  // Form states
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ semesterNumber: 1, sgpa: 8.5 });

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    credits: 3,
    faculty: '',
    difficulty: 'medium' as 'low' | 'medium' | 'high',
    priority: 'medium' as 'low' | 'medium' | 'high',
    color: '#8B5CF6',
    totalClasses: 30,
    attendedClasses: 25,
    internalMarks: 0,
    labMarks: 0,
    assignmentMarks: 0,
    targetGrade: 'S'
  });

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    subjectName: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
    xpReward: 100
  });

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    subjectName: '',
    examDate: '',
    expectedGrade: 'S',
    confidenceScore: 5
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    progress: 0,
    bugCount: 0,
    githubLink: '',
    deploymentStatus: 'none' as 'none' | 'staging' | 'production',
    milestones: [] as { title: string; completed: boolean }[]
  });

  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // AI study planner recommendation state
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center font-mono text-purple-400 animate-pulse">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 animate-spin" />
          CALIBRATING ACADEMIC TELEMETRY CORES...
        </div>
      </div>
    );
  }

  // --- CRUD Semester ---
  const handleSaveSemester = (e: React.FormEvent) => {
    e.preventDefault();
    play('click');
    const existing = profile?.semesters || [];
    const exists = existing.find((s: any) => s.semesterNumber === semesterForm.semesterNumber);
    
    let updated;
    if (exists) {
      updated = existing.map((s: any) => 
        s.semesterNumber === semesterForm.semesterNumber 
          ? { ...s, sgpa: semesterForm.sgpa } 
          : s
      );
    } else {
      updated = [...existing, { ...semesterForm, isActive: true }];
    }
    
    updateProfile({ semesters: updated, currentSemester: semesterForm.semesterNumber });
    setSelectedSemester(semesterForm.semesterNumber);
    setIsSemesterModalOpen(false);
  };

  const handleSetSemester = (num: number) => {
    play('click');
    setSelectedSemester(num);
    updateProfile({ currentSemester: num });
  };

  // --- CRUD Subject ---
  const handleOpenSubjectModal = (sub?: any) => {
    play('click');
    if (sub) {
      setEditSubjectId(sub._id);
      setSubjectForm({
        name: sub.name,
        credits: sub.credits || 3,
        faculty: sub.faculty || '',
        difficulty: sub.difficulty || 'medium',
        priority: sub.priority || 'medium',
        color: sub.color || '#8B5CF6',
        totalClasses: sub.totalClasses || 30,
        attendedClasses: sub.attendedClasses || 25,
        internalMarks: sub.internalMarks || 0,
        labMarks: sub.labMarks || 0,
        assignmentMarks: sub.assignmentMarks || 0,
        targetGrade: sub.targetGrade || 'S'
      });
    } else {
      setEditSubjectId(null);
      setSubjectForm({
        name: '',
        credits: 3,
        faculty: '',
        difficulty: 'medium',
        priority: 'medium',
        color: '#8B5CF6',
        totalClasses: 30,
        attendedClasses: 25,
        internalMarks: 0,
        labMarks: 0,
        assignmentMarks: 0,
        targetGrade: 'S'
      });
    }
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    play('click');
    const existing = profile?.subjects || [];
    let updated;
    
    if (editSubjectId) {
      updated = existing.map((s: any) => 
        s._id === editSubjectId 
          ? { ...s, ...subjectForm, semesterNumber: selectedSemester, attendancePercentage: s.totalClasses > 0 ? Math.round((s.attendedClasses / s.totalClasses) * 100) : 100 }
          : s
      );
    } else {
      const attPct = subjectForm.totalClasses > 0 ? Math.round((subjectForm.attendedClasses / subjectForm.totalClasses) * 100) : 100;
      updated = [...existing, { ...subjectForm, semesterNumber: selectedSemester, attendancePercentage: attPct }];
    }
    
    updateProfile({ subjects: updated });
    setIsSubjectModalOpen(false);
  };

  const handleDeleteSubject = (id: string) => {
    if (!confirm('Abandon metadata files for this subject?')) return;
    play('click');
    const updated = (profile?.subjects || []).filter((s: any) => s._id !== id);
    updateProfile({ subjects: updated });
  };

  // --- CRUD Assignment ---
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    play('click');
    const newAss = {
      ...assignmentForm,
      progress: 0,
      isCompleted: false
    };
    const updated = [...(profile?.assignments || []), newAss];
    updateProfile({ 
      assignments: updated,
      assignmentsPending: updated.filter(a => !a.isCompleted).length
    });
    setIsAssignmentModalOpen(false);
  };

  const handleCompleteAssignment = async (id: string) => {
    try {
      play('levelUp');
      await completeTask({ taskId: id, taskType: 'assignment' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = (id: string) => {
    if (!confirm('Discard this objective assignment?')) return;
    play('click');
    const updated = (profile?.assignments || []).filter((a: any) => a._id !== id);
    updateProfile({ 
      assignments: updated,
      assignmentsPending: updated.filter((a: any) => !a.isCompleted).length
    });
  };

  // --- CRUD Exam ---
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    play('click');
    const newExam = {
      ...examForm,
      preparationPercentage: 0,
      revisionsCompleted: 0,
      isCompleted: false
    };
    const updated = [...(profile?.exams || []), newExam];
    updateProfile({ 
      exams: updated,
      examsUpcoming: updated.filter(ex => !ex.isCompleted).length
    });
    setIsExamModalOpen(false);
  };

  const handleCompleteExam = async (id: string) => {
    try {
      play('levelUp');
      await completeTask({ taskId: id, taskType: 'exam' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExam = (id: string) => {
    if (!confirm('Discard this threat evaluation exam?')) return;
    play('click');
    const updated = (profile?.exams || []).filter((e: any) => e._id !== id);
    updateProfile({ 
      exams: updated,
      examsUpcoming: updated.filter((ex: any) => !ex.isCompleted).length
    });
  };

  // --- CRUD Projects ---
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    play('click');
    const updated = [...(profile?.projects || []), projectForm];
    updateProfile({ projects: updated });
    setIsProjectModalOpen(false);
    setProjectForm({ name: '', progress: 0, bugCount: 0, githubLink: '', deploymentStatus: 'none', milestones: [] });
  };

  const handleToggleMilestone = (projIdx: number, msIdx: number) => {
    play('click');
    const updatedProjs = [...(profile?.projects || [])];
    const ms = updatedProjs[projIdx].milestones[msIdx];
    ms.completed = !ms.completed;
    
    // Update progress percentage dynamically based on completed milestones
    const completedCount = updatedProjs[projIdx].milestones.filter((m: any) => m.completed).length;
    const totalCount = updatedProjs[projIdx].milestones.length;
    updatedProjs[projIdx].progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    updateProfile({ projects: updatedProjs });
  };

  const handleAddMilestoneToForm = () => {
    if (!newMilestoneTitle.trim()) return;
    setProjectForm({
      ...projectForm,
      milestones: [...projectForm.milestones, { title: newMilestoneTitle, completed: false }]
    });
    setNewMilestoneTitle('');
  };

  const handleDeleteProject = (idx: number) => {
    if (!confirm('Delete this academic project core?')) return;
    play('click');
    const updated = (profile?.projects || []).filter((_: any, i: number) => i !== idx);
    updateProfile({ projects: updated });
  };

  // --- Update Coding Stats ---
  const handleUpdateCodingStats = (field: string, val: any) => {
    const updated = {
      ...(profile?.codingTracker || { dsaSolved: 0, leetcodeSolved: 0, codeforcesRating: 0, githubCommits: 0, codingHours: 0, languages: [] }),
      [field]: val
    };
    updateProfile({ codingTracker: updated });
  };

  // --- Generate AI Study Plan ---
  const triggerAIPlanner = () => {
    play('click');
    setIsGeneratingPlan(true);
    // Simulate smart planner compilation
    setTimeout(() => {
      setIsGeneratingPlan(false);
      play('levelUp');
      const newPlan = {
        title: `AI Revision Focus: ${new Date().toLocaleDateString()}`,
        tasks: [
          { title: "Complete critical subject internal revision", duration: 60, isCompleted: false },
          { title: "Solve 5 Medium questions on LeetCode", duration: 45, isCompleted: false },
          { title: "Review DBMS milestone assignments", duration: 30, isCompleted: false }
        ]
      };
      updateProfile({ studyPlans: [...(profile?.studyPlans || []), newPlan] });
    }, 1500);
  };

  const toggleStudyPlanTask = (planIdx: number, taskIdx: number) => {
    play('click');
    const updatedPlans = [...(profile?.studyPlans || [])];
    const t = updatedPlans[planIdx].tasks[taskIdx];
    t.isCompleted = !t.isCompleted;
    updateProfile({ studyPlans: updatedPlans });
  };

  // --- Calculations & Stats Helpers ---
  const activeSemesterSubjects = (profile?.subjects || []).filter(
    (s: any) => s.semesterNumber === selectedSemester
  );

  const calculateAttendanceIntelligence = (sub: any) => {
    const total = sub.totalClasses || 0;
    const attended = sub.attendedClasses || 0;
    const currentPct = total > 0 ? (attended / total) * 100 : 100;
    
    let advice: string;
    let statusClass: string;
    
    if (currentPct >= 75) {
      // Find how many consecutive classes can be skipped
      // (attended - skip) / (total) >= 0.75 => attended - skip >= 0.75 * total => skip <= attended - 0.75 * total
      const maxSkip = Math.floor(attended - (0.75 * total));
      advice = maxSkip > 0 
        ? `🟢 Safe Zone. You can skip next ${maxSkip} class(es).` 
        : `🟡 Borderline. Do not skip any classes.`;
      statusClass = 'text-green-400';
    } else {
      // Find how many consecutive classes must be attended
      // (attended + attend) / (total + attend) >= 0.75 => attended + attend >= 0.75 * total + 0.75 * attend
      // => 0.25 * attend >= 0.75 * total - attended => attend >= (0.75 * total - attended) / 0.25
      const mustAttend = Math.ceil((0.75 * total - attended) / 0.25);
      advice = `🔴 Warning! Attendance low. Must attend next ${mustAttend} class(es) consecutively.`;
      statusClass = 'text-red-400';
    }
    
    return { currentPct, advice, statusClass };
  };

  // Dynamic CGPA calculations
  const calculateDerivedCGPA = () => {
    const semesters = profile?.semesters || [];
    if (semesters.length === 0) return 0.00;
    const totalSGPA = semesters.reduce((acc: number, curr: any) => acc + (curr.sgpa || 0), 0);
    return totalSGPA / semesters.length;
  };

  // Sort exams and assignments chronologically
  const sortedCalendarEvents = [
    ...(profile?.assignments || []).map((a: any) => ({ ...a, type: 'Assignment', date: a.dueDate, color: 'border-cyan-500 text-cyan-400' })),
    ...(profile?.exams || []).map((e: any) => ({ ...e, type: 'Exam', date: e.examDate, color: 'border-rose-500 text-rose-400' }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="relative min-h-screen text-white font-mono bg-black pb-32">
      
      {/* Background glow styling */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-transparent to-transparent opacity-40" />
      </div>

      <div className="space-y-6 relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* HEADER PANEL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-slate-900/60 p-6 rounded-xl border border-purple-900/30 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest">
              <GraduationCap className="w-5 h-5" /> Academic Intelligence Matrix
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-white mt-1 tracking-wider">
              ACADEMIC <span className="text-purple-500">COMMAND CENTER</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Optimize semesters, targets, exams, and progression indexes.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="text-right">
              <span className="text-[9px] text-gray-500 block uppercase tracking-widest">SEMESTER INDEX</span>
              <span className="text-xl font-bold text-purple-400">SEM {selectedSemester}</span>
            </div>
            <div className="text-right border-l border-purple-900/50 pl-4">
              <span className="text-[9px] text-gray-500 block uppercase tracking-widest">CGPA METRIC</span>
              <span className="text-xl font-bold text-green-400">{calculateDerivedCGPA().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex overflow-x-auto gap-2 py-1 border-b border-purple-950/30 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
          {[
            { id: 'hub', label: 'HUB TELEMETRY' },
            { id: 'subjects', label: 'SUBJECT FILES' },
            { id: 'assignments', label: 'ASSIGNMENTS' },
            { id: 'exams', label: 'EXAMS' },
            { id: 'projects', label: 'PROJECT CORE' },
            { id: 'coding', label: 'CODING FORGE' },
            { id: 'calendar', label: 'CALENDAR' },
            { id: 'planner', label: 'AI PLANNER' },
            { id: 'analytics', label: 'ANALYTICS' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { play('click'); setActiveTab(tab.id as ActiveTabType); }}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-purple-900/20 transition-all rounded ${
                activeTab === tab.id 
                  ? 'bg-purple-950/80 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]' 
                  : 'bg-black/35 hover:bg-purple-950/20 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DYNAMIC SCREEN CONTENT */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HUB TELEMETRY */}
          {activeTab === 'hub' && (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Semester History selector */}
              <div className="lg:col-span-2 space-y-6">
                <SystemWindow title="Active Semesters Selector">
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                      const sem = (profile?.semesters || []).find((s: any) => s.semesterNumber === num);
                      return (
                        <button
                          key={num}
                          onClick={() => handleSetSemester(num)}
                          className={`w-20 py-3 border rounded text-center transition-all ${
                            selectedSemester === num 
                              ? 'bg-purple-950/70 border-purple-500 text-purple-300 font-bold' 
                              : sem 
                                ? 'bg-slate-900/50 border-purple-900/40 text-slate-300' 
                                : 'bg-black/30 border-gray-800 text-gray-600'
                          }`}
                        >
                          <div className="text-[9px] uppercase font-mono">SEM {num}</div>
                          <div className="text-xs font-bold mt-1">{sem ? `SG ${sem.sgpa.toFixed(1)}` : 'EMPTY'}</div>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => { play('click'); setIsSemesterModalOpen(true); }}
                      className="px-4 py-3 bg-purple-950/10 border border-dashed border-purple-500/40 hover:border-purple-400 rounded flex items-center justify-center text-purple-400 font-bold text-xs"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Initialize Sem
                    </button>
                  </div>
                </SystemWindow>

                {/* Subjects of Selected Semester */}
                <SystemWindow title={`Subject telemetries - Semester ${selectedSemester}`}>
                  <div className="space-y-4">
                    {activeSemesterSubjects.map((sub: any) => {
                      const { currentPct, statusClass } = calculateAttendanceIntelligence(sub);
                      return (
                        <div key={sub._id} className="p-4 bg-black/40 border border-purple-900/20 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: sub.color }} />
                            <div>
                              <div className="font-bold text-white uppercase">{sub.name}</div>
                              <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                                CREDITS: {sub.credits} | FACULTY: {sub.faculty || 'Unassigned'}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto md:justify-end">
                            <div className="text-right">
                              <span className="text-[9px] text-gray-500 block uppercase">Attendance</span>
                              <span className={`text-sm font-bold ${statusClass}`}>{currentPct.toFixed(1)}%</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-500 block uppercase">Internal Marks</span>
                              <span className="text-sm font-bold text-cyan-400">{sub.internalMarks} / 50</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-500 block uppercase">Target Grade</span>
                              <span className="text-sm font-bold text-yellow-400">{sub.targetGrade}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {activeSemesterSubjects.length === 0 && (
                      <div className="text-center py-10 border border-dashed border-purple-900/30 rounded text-slate-500 font-mono text-xs">
                        "Academic Database Empty. Initialize your semester or ask Iggris to create your academic profile."
                      </div>
                    )}
                  </div>
                </SystemWindow>
              </div>

              {/* Study Intelligence Quick Panel */}
              <div className="space-y-6">
                
                {/* AI Study Planner Quick Actions */}
                <SystemWindow title="Intelligence Assistant">
                  <div className="text-center p-4">
                    <BrainCircuit className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-pulse" />
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Iggris Study Intelligence</h3>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Calibrate revision algorithms based on pending tasks, attendance margins, and exams.
                    </p>
                    <PrimaryButton 
                      onClick={triggerAIPlanner} 
                      disabled={isGeneratingPlan} 
                      className="w-full mt-4 !py-2.5 min-h-[44px] text-[10px]"
                    >
                      {isGeneratingPlan ? "ANALYZING TARGET METRICS..." : "COMPILE PERSONALIZED STUDY PLAN"}
                    </PrimaryButton>
                  </div>
                </SystemWindow>

                {/* Core Parameters overview */}
                <SystemWindow title="Academic Indexes">
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex justify-between items-center p-3 bg-black/40 border border-purple-900/20 rounded">
                      <span className="text-slate-400">PENDING ASSIGNMENTS:</span>
                      <span className="text-yellow-400 font-bold">{(profile?.assignments || []).filter((a: any) => !a.isCompleted).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/40 border border-purple-900/20 rounded">
                      <span className="text-slate-400">UPCOMING EXAMS:</span>
                      <span className="text-rose-400 font-bold">{(profile?.exams || []).filter((e: any) => !e.isCompleted).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-black/40 border border-purple-900/20 rounded">
                      <span className="text-slate-400">ACTIVE PROJECT BLUEPRINTS:</span>
                      <span className="text-cyan-400 font-bold">{(profile?.projects || []).length}</span>
                    </div>
                  </div>
                </SystemWindow>

              </div>
            </motion.div>
          )}

          {/* TAB 2: SUBJECT FILES */}
          {activeTab === 'subjects' && (
            <motion.div 
              key="subjects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-purple-900/30 rounded-lg">
                <span className="text-xs text-slate-400 uppercase">SUBJECT DATABASES FOR SEMESTER {selectedSemester}</span>
                <button
                  onClick={() => handleOpenSubjectModal()}
                  className="px-4 py-2 bg-purple-950 border border-purple-500 hover:bg-purple-900 text-purple-300 rounded font-bold text-xs"
                >
                  <Plus className="w-4 h-4 inline-block mr-1" /> Add Subject File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSemesterSubjects.map((sub: any) => {
                  const { currentPct, advice, statusClass } = calculateAttendanceIntelligence(sub);
                  return (
                    <div key={sub._id} className="bg-slate-950/60 border border-purple-900/30 p-5 rounded-xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                          <h3 className="font-bold text-white uppercase text-sm tracking-wide">{sub.name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenSubjectModal(sub)} className="text-gray-500 hover:text-cyan-400 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteSubject(sub._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] font-mono border-t border-purple-900/10 pt-3">
                        <div>
                          <span className="text-gray-500 block uppercase">Credits</span>
                          <span className="text-white font-bold">{sub.credits} CREDITS</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Faculty</span>
                          <span className="text-white truncate block font-bold">{sub.faculty || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Internal Marks</span>
                          <span className="text-white font-bold">{sub.internalMarks} / 50</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Lab Marks</span>
                          <span className="text-white font-bold">{sub.labMarks || 0} / 50</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Assignment Marks</span>
                          <span className="text-white font-bold">{sub.assignmentMarks || 0} / 20</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Difficulty</span>
                          <span className={`font-bold uppercase ${sub.difficulty === 'high' ? 'text-red-400' : sub.difficulty === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                            {sub.difficulty || 'medium'}
                          </span>
                        </div>
                      </div>

                      {/* Attendance indicator */}
                      <div className="border-t border-purple-900/10 pt-3 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 uppercase">ATTENDANCE REPORT</span>
                          <span className={`font-bold ${statusClass}`}>{currentPct.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Classes attended:</span>
                          <span>{sub.attendedClasses} / {sub.totalClasses}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full" 
                            style={{ width: `${currentPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] italic mt-1">{advice}</div>
                      </div>
                    </div>
                  );
                })}

                {activeSemesterSubjects.length === 0 && (
                  <div className="col-span-full text-center py-20 border border-dashed border-purple-900/30 rounded text-slate-500 font-mono text-xs">
                    "Academic Database Empty. Initialize your semester or ask Iggris to create your academic profile."
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <motion.div 
              key="assignments"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-purple-900/30 rounded-lg">
                <span className="text-xs text-slate-400 uppercase">Pending Academic trials</span>
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className="px-4 py-2 bg-purple-950 border border-purple-500 hover:bg-purple-900 text-purple-300 rounded font-bold text-xs"
                >
                  <Plus className="w-4 h-4 inline-block mr-1" /> Log Assignment
                </button>
              </div>

              <div className="space-y-4">
                {(profile?.assignments || []).map((ass: any) => (
                  <div key={ass._id} className="p-4 bg-slate-950/60 border border-purple-900/20 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${ass.isCompleted ? 'bg-green-950/40 border border-green-800 text-green-400' : 'bg-yellow-950/40 border border-yellow-800 text-yellow-400'}`}>
                        <Calendar size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase">{ass.title}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          SUBJECT: {ass.subjectName} | DUE: {ass.dueDate} | PRIORITY: {ass.priority.toUpperCase()}
                        </div>
                        {ass.notes && <div className="text-[11px] text-slate-400 mt-1 italic">"{ass.notes}"</div>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center w-full md:w-auto md:justify-end">
                      <span className="text-xs text-purple-400 font-bold">+{ass.xpReward || 100} XP</span>
                      
                      {!ass.isCompleted ? (
                        <button
                          onClick={() => handleCompleteAssignment(ass._id)}
                          className="px-3.5 py-2 bg-green-950/80 border border-green-700 hover:border-green-400 text-green-400 hover:text-white rounded font-mono text-xs transition-colors font-bold min-h-[44px]"
                        >
                          Complete Trial
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-950/20 border border-green-800 text-green-400 text-[10px] font-bold rounded">
                          CLEARED
                        </span>
                      )}

                      <button onClick={() => handleDeleteAssignment(ass._id)} className="text-gray-500 hover:text-red-400 transition-colors p-2 min-h-[44px] flex items-center justify-center">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {(profile?.assignments || []).length === 0 && (
                  <div className="text-center py-20 border border-dashed border-purple-900/30 rounded text-slate-500 font-mono text-xs">
                    "No pending assignment trials found. Keep checking your academic objectives."
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: EXAMS */}
          {activeTab === 'exams' && (
            <motion.div 
              key="exams"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-purple-900/30 rounded-lg">
                <span className="text-xs text-slate-400 uppercase">Upcoming Major evaluations</span>
                <button
                  onClick={() => setIsExamModalOpen(true)}
                  className="px-4 py-2 bg-purple-950 border border-purple-500 hover:bg-purple-900 text-purple-300 rounded font-bold text-xs"
                >
                  <Plus className="w-4 h-4 inline-block mr-1" /> Log Exam Objective
                </button>
              </div>

              <div className="space-y-4">
                {(profile?.exams || []).map((exam: any) => {
                  const daysLeft = Math.ceil((new Date(exam.examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={exam._id} className="p-4 bg-slate-950/60 border border-purple-900/20 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${exam.isCompleted ? 'bg-green-950/40 border border-green-800 text-green-400' : 'bg-red-950/40 border border-red-800 text-red-400'}`}>
                          <Award size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-white uppercase">{exam.title}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            SUBJECT: {exam.subjectName} | DATE: {exam.examDate} | EXPECTED GRADE: {exam.expectedGrade}
                          </div>
                          {!exam.isCompleted && (
                            <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                              <span className="text-cyan-400 font-bold">Confidence: {exam.confidenceScore || 5}/10</span>
                              <span className="text-slate-400">Revisions: {exam.revisionsCompleted || 0}</span>
                              <span className={`font-bold ${daysLeft > 3 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                {daysLeft > 0 ? `Countdown: ${daysLeft} days` : 'Exam Due Today'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center w-full md:w-auto md:justify-end">
                        <span className="text-xs text-purple-400 font-bold">+250 XP</span>
                        
                        {!exam.isCompleted ? (
                          <button
                            onClick={() => handleCompleteExam(exam._id)}
                            className="px-3.5 py-2 bg-green-950/80 border border-green-700 hover:border-green-400 text-green-400 hover:text-white rounded font-mono text-xs transition-colors font-bold min-h-[44px]"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-green-950/20 border border-green-800 text-green-400 text-[10px] font-bold rounded">
                            CLEARED
                          </span>
                        )}

                        <button onClick={() => handleDeleteExam(exam._id)} className="text-gray-500 hover:text-red-400 transition-colors p-2 min-h-[44px] flex items-center justify-center">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(profile?.exams || []).length === 0 && (
                  <div className="text-center py-20 border border-dashed border-purple-900/30 rounded text-slate-500 font-mono text-xs">
                    "No upcoming major exam evaluations registered."
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === 'projects' && (
            <motion.div 
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-purple-900/30 rounded-lg">
                <span className="text-xs text-slate-400 uppercase">Milestones Project Blueprints</span>
                <button
                  onClick={() => setIsProjectModalOpen(true)}
                  className="px-4 py-2 bg-purple-950 border border-purple-500 hover:bg-purple-900 text-purple-300 rounded font-bold text-xs"
                >
                  <Plus className="w-4 h-4 inline-block mr-1" /> Initialize Project
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(profile?.projects || []).map((proj: any, pIdx: number) => (
                  <div key={pIdx} className="bg-slate-950/60 border border-purple-900/20 p-5 rounded-xl space-y-4 font-mono">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white uppercase text-base">{proj.name}</h4>
                        <div className="text-[10px] text-gray-500 uppercase mt-0.5">
                          DEPLOYMENT: {proj.deploymentStatus || 'NONE'} | BUGS LOGGED: {proj.bugCount}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteProject(pIdx)} className="text-gray-500 hover:text-red-400 transition-colors p-2 min-h-[44px]">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Progress Slider representation */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">METRIC PROGRESS:</span>
                        <span className="text-cyan-400 font-bold">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                    </div>

                    {/* Milestones checklist */}
                    <div className="space-y-2 border-t border-purple-900/10 pt-3">
                      <span className="text-[10px] text-gray-500 block uppercase">Milestones Checklist</span>
                      {(proj.milestones || []).map((ms: any, mIdx: number) => (
                        <div key={mIdx} className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() => handleToggleMilestone(pIdx, mIdx)}
                            className={`p-1 border rounded text-xs transition-colors flex items-center justify-center min-h-[32px] min-w-[32px] ${ms.completed ? 'bg-purple-950 border-purple-500 text-purple-400' : 'bg-transparent border-gray-700 text-gray-500'}`}
                          >
                            <Check size={12} />
                          </button>
                          <span className={ms.completed ? 'text-gray-500 line-through' : 'text-slate-200'}>
                            {ms.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {proj.githubLink && (
                      <div className="flex items-center gap-2 text-xs text-purple-400 hover:underline pt-2 border-t border-purple-900/10">
                        <GithubIcon size={14} />
                        <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className="truncate">
                          {proj.githubLink}
                        </a>
                        <ExternalLink size={12} className="flex-shrink-0" />
                      </div>
                    )}
                  </div>
                ))}

                {(profile?.projects || []).length === 0 && (
                  <div className="col-span-full text-center py-20 border border-dashed border-purple-900/30 rounded text-slate-500 font-mono text-xs">
                    "No active milestone projects assigned to this semester."
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: CODING FORGE */}
          {activeTab === 'coding' && (
            <motion.div 
              key="coding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Solved Counters */}
              <div className="lg:col-span-2 space-y-6">
                <SystemWindow title="Forge Progress Stats">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
                    <div className="bg-slate-950/60 p-4 border border-purple-900/20 rounded-xl">
                      <span className="text-[10px] text-gray-500 block uppercase">DSA SOLVED</span>
                      <input 
                        type="number" 
                        value={profile?.codingTracker?.dsaSolved || 0}
                        onChange={(e) => handleUpdateCodingStats('dsaSolved', parseInt(e.target.value) || 0)}
                        className="bg-transparent text-xl font-bold text-white w-full border-b border-purple-950 focus:border-purple-500 focus:outline-none mt-2"
                      />
                    </div>
                    <div className="bg-slate-950/60 p-4 border border-purple-900/20 rounded-xl">
                      <span className="text-[10px] text-gray-500 block uppercase">LeetCode Solved</span>
                      <input 
                        type="number" 
                        value={profile?.codingTracker?.leetcodeSolved || 0}
                        onChange={(e) => handleUpdateCodingStats('leetcodeSolved', parseInt(e.target.value) || 0)}
                        className="bg-transparent text-xl font-bold text-cyan-400 w-full border-b border-purple-950 focus:border-purple-500 focus:outline-none mt-2"
                      />
                    </div>
                    <div className="bg-slate-950/60 p-4 border border-purple-900/20 rounded-xl">
                      <span className="text-[10px] text-gray-500 block uppercase">CF Rating</span>
                      <input 
                        type="number" 
                        value={profile?.codingTracker?.codeforcesRating || 0}
                        onChange={(e) => handleUpdateCodingStats('codeforcesRating', parseInt(e.target.value) || 0)}
                        className="bg-transparent text-xl font-bold text-yellow-400 w-full border-b border-purple-950 focus:border-purple-500 focus:outline-none mt-2"
                      />
                    </div>
                    <div className="bg-slate-950/60 p-4 border border-purple-900/20 rounded-xl">
                      <span className="text-[10px] text-gray-500 block uppercase">Weekly commits</span>
                      <input 
                        type="number" 
                        value={profile?.codingTracker?.githubCommits || 0}
                        onChange={(e) => handleUpdateCodingStats('githubCommits', parseInt(e.target.value) || 0)}
                        className="bg-transparent text-xl font-bold text-purple-400 w-full border-b border-purple-950 focus:border-purple-500 focus:outline-none mt-2"
                      />
                    </div>
                  </div>
                </SystemWindow>

                {/* Programming Languages Dial */}
                <SystemWindow title="Technological Mastery">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Input your primary programming languages separated by commas:
                    </p>
                    <input 
                      type="text" 
                      placeholder="e.g. JavaScript, TypeScript, Python, C++"
                      value={(profile?.codingTracker?.languages || []).join(', ')}
                      onChange={(e) => handleUpdateCodingStats('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full bg-slate-950 border border-purple-900/40 rounded p-3 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                    />
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(profile?.codingTracker?.languages || []).map((lang: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-purple-950/40 border border-purple-800 text-purple-300 text-[10px] font-bold rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </SystemWindow>
              </div>

              {/* Weekly Coding Hours */}
              <div className="space-y-6 font-mono">
                <SystemWindow title="Hourly logs">
                  <div className="bg-slate-950/60 p-5 border border-purple-900/20 rounded-xl text-center">
                    <Code className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                    <span className="text-[10px] text-gray-500 block uppercase">Weekly Coding Hours</span>
                    
                    <input 
                      type="number" 
                      value={profile?.codingTracker?.codingHours || 0}
                      onChange={(e) => handleUpdateCodingStats('codingHours', parseFloat(e.target.value) || 0)}
                      className="bg-transparent text-3xl font-extrabold text-white text-center w-24 border-b border-purple-950 focus:border-purple-500 focus:outline-none mt-2"
                    />
                    <span className="text-xs text-gray-400 ml-1.5 font-bold">hrs</span>
                  </div>
                </SystemWindow>
              </div>
            </motion.div>
          )}

          {/* TAB 7: CALENDAR */}
          {activeTab === 'calendar' && (
            <motion.div 
              key="calendar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <SystemWindow title="Academic Chronology Timeline">
                <div className="space-y-6 font-mono">
                  {sortedCalendarEvents.map((evt: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-stretch relative">
                      {idx < sortedCalendarEvents.length - 1 && (
                        <div className="absolute left-[13px] top-6 bottom-[-24px] w-0.5 bg-purple-900/30" />
                      )}
                      
                      <div className="w-7 h-7 rounded-full bg-slate-950 border border-purple-900/40 flex items-center justify-center text-purple-400 z-10 text-xs">
                        {idx + 1}
                      </div>

                      <div className={`flex-1 p-4 bg-slate-950/40 border-l-2 ${evt.color} rounded`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase border bg-black/45 border-white/5 mr-2">
                              {evt.type}
                            </span>
                            <span className="font-bold text-white uppercase text-xs">{evt.title}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">{evt.date}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase">
                          Subject: {evt.subjectName} | Priority: {evt.priority || 'medium'}
                        </div>
                      </div>
                    </div>
                  ))}

                  {sortedCalendarEvents.length === 0 && (
                    <div className="text-center py-20 text-slate-500 text-xs">
                      "Academic Calendar Empty. Register assignments or exams to compile a chronology."
                    </div>
                  )}
                </div>
              </SystemWindow>
            </motion.div>
          )}

          {/* TAB 8: AI PLANNER */}
          {activeTab === 'planner' && (
            <motion.div 
              key="planner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-purple-900/30 rounded-lg">
                <span className="text-xs text-slate-400 uppercase">AI Revision Strategies</span>
                <PrimaryButton 
                  onClick={triggerAIPlanner} 
                  disabled={isGeneratingPlan} 
                  className="!py-2 min-h-[44px] text-xs font-bold font-mono"
                >
                  <RefreshCw className={`w-3.5 h-3.5 inline-block mr-1.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} /> 
                  Compile Study Schedule
                </PrimaryButton>
              </div>

              <div className="space-y-6">
                {(profile?.studyPlans || []).map((plan: any, pIdx: number) => (
                  <SystemWindow key={pIdx} title={plan.title}>
                    <div className="space-y-3 font-mono text-xs">
                      {plan.tasks.map((task: any, tIdx: number) => (
                        <div key={tIdx} className="flex items-center gap-3 p-3 bg-black/40 border border-purple-900/20 rounded">
                          <button
                            onClick={() => toggleStudyPlanTask(pIdx, tIdx)}
                            className={`p-1 border rounded text-xs transition-colors flex items-center justify-center min-h-[36px] min-w-[36px] ${task.isCompleted ? 'bg-green-950 border-green-600 text-green-400' : 'bg-transparent border-gray-700 text-gray-500'}`}
                          >
                            <Check size={14} />
                          </button>
                          <div className="flex-1">
                            <span className={task.isCompleted ? 'text-gray-500 line-through' : 'text-slate-200'}>
                              {task.title}
                            </span>
                            <span className="text-[10px] text-gray-500 block uppercase mt-0.5">TARGET DURATION: {task.duration} MINS</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SystemWindow>
                ))}

                {(profile?.studyPlans || []).length === 0 && (
                  <div className="text-center py-20 border border-dashed border-purple-900/30 rounded text-slate-500 font-mono text-xs">
                    "AI Study Planner modules uninitialized. Complete daily conditioning missions to unlock planner nodes."
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 9: ANALYTICS */}
          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* CGPA Semester comparison line chart */}
              <SystemWindow title="Academic Progression Index (SGPA/Semester)">
                <div className="h-[250px] w-full font-mono text-[10px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profile?.semesters || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                      <XAxis dataKey="semesterNumber" stroke="rgba(255, 255, 255, 0.5)" />
                      <YAxis domain={[0, 10]} stroke="rgba(255, 255, 255, 0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)' }} />
                      <Line type="monotone" dataKey="sgpa" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: '#8B5CF6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SystemWindow>

              {/* Attendance Subject-wise bar chart */}
              <SystemWindow title="Attendance Distribution Per Subject (%)">
                <div className="h-[250px] w-full font-mono text-[10px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeSemesterSubjects}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" />
                      <YAxis domain={[0, 100]} stroke="rgba(255, 255, 255, 0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(139, 92, 246, 0.4)' }} />
                      <Bar dataKey="attendancePercentage" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SystemWindow>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* --- ALL DIALOG MODALS --- */}
      
      {/* 1. Add Semester Dialog */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-slate-900 border border-purple-950 p-6 rounded-xl space-y-4 font-mono">
            <h3 className="font-bold text-white text-base uppercase">Initialize Semester File</h3>
            <form onSubmit={handleSaveSemester} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Semester Number</label>
                <input 
                  type="number" 
                  min={1} 
                  max={8} 
                  required
                  value={semesterForm.semesterNumber}
                  onChange={(e) => setSemesterForm({ ...semesterForm, semesterNumber: parseInt(e.target.value) || 1 })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Target SGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min={0} 
                  max={10} 
                  required
                  value={semesterForm.sgpa}
                  onChange={(e) => setSemesterForm({ ...semesterForm, sgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsSemesterModalOpen(false)} className="px-4 py-2 border border-gray-800 hover:text-white rounded text-xs transition-colors min-h-[44px]">
                  Cancel
                </button>
                <PrimaryButton type="submit" className="text-xs min-h-[44px]">
                  Initialize File
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Add/Edit Subject Dialog */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-slate-900 border border-purple-950 p-6 rounded-xl space-y-4 font-mono max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-white text-base uppercase">
              {editSubjectId ? 'Update Subject Database' : 'Register Subject File'}
            </h3>
            <form onSubmit={handleSaveSubject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Subject Name</label>
                <input 
                  type="text" 
                  required 
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Credits</label>
                  <input 
                    type="number" 
                    required 
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: parseInt(e.target.value) || 3 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Faculty</label>
                  <input 
                    type="text" 
                    value={subjectForm.faculty}
                    onChange={(e) => setSubjectForm({ ...subjectForm, faculty: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Total Classes</label>
                  <input 
                    type="number" 
                    required 
                    value={subjectForm.totalClasses}
                    onChange={(e) => setSubjectForm({ ...subjectForm, totalClasses: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Attended Classes</label>
                  <input 
                    type="number" 
                    required 
                    value={subjectForm.attendedClasses}
                    onChange={(e) => setSubjectForm({ ...subjectForm, attendedClasses: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Internals (Max 50)</label>
                  <input 
                    type="number" 
                    value={subjectForm.internalMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, internalMarks: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Labs (Max 50)</label>
                  <input 
                    type="number" 
                    value={subjectForm.labMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, labMarks: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Assignments (Max 20)</label>
                  <input 
                    type="number" 
                    value={subjectForm.assignmentMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, assignmentMarks: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Difficulty</label>
                  <select 
                    value={subjectForm.difficulty}
                    onChange={(e: any) => setSubjectForm({ ...subjectForm, difficulty: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Priority</label>
                  <select 
                    value={subjectForm.priority}
                    onChange={(e: any) => setSubjectForm({ ...subjectForm, priority: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Target Grade</label>
                  <select 
                    value={subjectForm.targetGrade}
                    onChange={(e) => setSubjectForm({ ...subjectForm, targetGrade: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="S">S Grade</option>
                    <option value="A">A Grade</option>
                    <option value="B">B Grade</option>
                    <option value="C">C Grade</option>
                    <option value="D">D Grade</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Subject Color Accent</label>
                <input 
                  type="color" 
                  value={subjectForm.color}
                  onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                  className="w-full bg-transparent h-10 border border-purple-900 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-4 py-2 border border-gray-800 hover:text-white rounded text-xs transition-colors min-h-[44px]">
                  Cancel
                </button>
                <PrimaryButton type="submit" className="text-xs min-h-[44px]">
                  Save Subject Database
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Add Assignment Dialog */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-slate-900 border border-purple-950 p-6 rounded-xl space-y-4 font-mono">
            <h3 className="font-bold text-white text-base uppercase">Register Academic Assignment</h3>
            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Assignment Title</label>
                <input 
                  type="text" 
                  required 
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Linked Subject</label>
                <select 
                  value={assignmentForm.subjectName}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subjectName: e.target.value })}
                  required
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select Linked Subject</option>
                  {activeSemesterSubjects.map((s: any) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Due Date</label>
                  <input 
                    type="date" 
                    required 
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">XP Reward</label>
                  <input 
                    type="number" 
                    value={assignmentForm.xpReward}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, xpReward: parseInt(e.target.value) || 100 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Priority</label>
                <select 
                  value={assignmentForm.priority}
                  onChange={(e: any) => setAssignmentForm({ ...assignmentForm, priority: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Notes & Coordinates</label>
                <textarea 
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsAssignmentModalOpen(false)} className="px-4 py-2 border border-gray-800 hover:text-white rounded text-xs transition-colors min-h-[44px]">
                  Cancel
                </button>
                <PrimaryButton type="submit" className="text-xs min-h-[44px]">
                  Save Assignment
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Add Exam Dialog */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-slate-900 border border-purple-950 p-6 rounded-xl space-y-4 font-mono">
            <h3 className="font-bold text-white text-base uppercase">Register Exam Trial</h3>
            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Exam Title</label>
                <input 
                  type="text" 
                  required 
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Linked Subject</label>
                <select 
                  value={examForm.subjectName}
                  onChange={(e) => setExamForm({ ...examForm, subjectName: e.target.value })}
                  required
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select Linked Subject</option>
                  {activeSemesterSubjects.map((s: any) => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Exam Date</label>
                  <input 
                    type="date" 
                    required 
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Confidence (1-10)</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    required 
                    value={examForm.confidenceScore}
                    onChange={(e) => setExamForm({ ...examForm, confidenceScore: parseInt(e.target.value) || 5 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Expected Grade</label>
                <select 
                  value={examForm.expectedGrade}
                  onChange={(e) => setExamForm({ ...examForm, expectedGrade: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="S">S Grade</option>
                  <option value="A">A Grade</option>
                  <option value="B">B Grade</option>
                  <option value="C">C Grade</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsExamModalOpen(false)} className="px-4 py-2 border border-gray-800 hover:text-white rounded text-xs transition-colors min-h-[44px]">
                  Cancel
                </button>
                <PrimaryButton type="submit" className="text-xs min-h-[44px]">
                  Save Exam
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Add Project Dialog */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-slate-900 border border-purple-950 p-6 rounded-xl space-y-4 font-mono max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="font-bold text-white text-base uppercase">Initialize Project Blueprint</h3>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">Project Name</label>
                <input 
                  type="text" 
                  required 
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Bug Count</label>
                  <input 
                    type="number" 
                    value={projectForm.bugCount}
                    onChange={(e) => setProjectForm({ ...projectForm, bugCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase block">Deployment State</label>
                  <select 
                    value={projectForm.deploymentStatus}
                    onChange={(e: any) => setProjectForm({ ...projectForm, deploymentStatus: e.target.value })}
                    className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase block">GitHub Link</label>
                <input 
                  type="text" 
                  value={projectForm.githubLink}
                  onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })}
                  className="w-full bg-black/60 border border-purple-900 rounded p-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Milestones in Modal Builder */}
              <div className="space-y-2 border-t border-purple-900/10 pt-3">
                <label className="text-[10px] text-gray-500 uppercase block">Milestones checklist</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="New milestone..." 
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="flex-1 bg-black/60 border border-purple-900 rounded p-2 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={handleAddMilestoneToForm} 
                    className="px-3 bg-purple-950 border border-purple-600 rounded text-purple-300 hover:text-white transition-colors text-xs font-bold min-h-[36px]"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1.5 pt-1">
                  {projectForm.milestones.map((ms, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{ms.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 border border-gray-800 hover:text-white rounded text-xs transition-colors min-h-[44px]">
                  Cancel
                </button>
                <PrimaryButton type="submit" className="text-xs min-h-[44px]">
                  Save Project Blueprint
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AcademicDashboard;
