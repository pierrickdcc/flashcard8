import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, BookOpen, Search, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

const CoursePage = () => {
  const { courses, subjects } = useDataSync();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const coursesBySubject = useMemo(() => {
    if (!courses || !subjects) return [];

    let filteredCourses = courses;
    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        filteredCourses = courses.filter(course =>
            (course.title && course.title.toLowerCase().includes(lowercasedQuery)) ||
            (course.content && course.content.toLowerCase().includes(lowercasedQuery))
        );
    }
    
    return subjects
      .map(subject => ({
        ...subject,
        courses: filteredCourses.filter(course => course.subject_id === subject.id)
      }))
      .filter(subject => subject.courses.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [courses, subjects, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <BookOpen className="text-[var(--color-subjects)]" size={32} />
            Mes Cours
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Bibliothèque de vos fiches de révision.</p>
        </div>

        <div className="relative w-full max-w-md">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
           <input
            type="text"
            placeholder="Rechercher dans vos cours..."
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-main)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {coursesBySubject.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours trouvé"
          message={searchQuery ? "Aucun résultat pour votre recherche." : "Commencez par ajouter votre premier cours."}
        />
      ) : (
        <div className="flex flex-col gap-8">
          {coursesBySubject.map(subject => (
            <motion.section
              key={subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4 ml-1">
                <h2 className="text-xl font-semibold text-[var(--text-main)]">{subject.name}</h2>
                <div className="h-[1px] flex-1 bg-[var(--border)] opacity-50"></div>
                <span className="text-xs font-medium text-[var(--text-muted)] px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
                  {subject.courses.length} cours
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subject.courses.map(course => (
                  <motion.div
                    key={course.id}
                    whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="glass-card group cursor-pointer relative overflow-hidden border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                  >
                    {/* Decoration Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-lg bg-[var(--bg-body)] text-[var(--primary)]">
                        <FileText size={24} />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 text-[var(--text-muted)]">
                        <ChevronRight size={20} />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                      {course.title}
                    </h3>

                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatDate(course.updated_at)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CoursePage;
