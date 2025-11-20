import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataSync } from '../context/DataSyncContext';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';
import styles from './CourseViewer.module.css';

const CourseViewer = () => {
  const { courseId } = useParams();
  const { courses, subjects } = useDataSync();
  const navigate = useNavigate();

  const course = courses?.find(c => c.id.toString() === courseId);
  
  const subjectName = useMemo(() => {
    if (!course || !subjects) return 'N/A';
    const subject = subjects.find(s => s.id === course.subject_id);
    return subject ? subject.name : 'N/A';
  }, [course, subjects]);

  useEffect(() => { window.scrollTo(0, 0); }, [courseId]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
        <h2 className="text-xl font-semibold mb-4">Cours introuvable</h2>
        <button onClick={() => navigate('/courses')} className="btn btn-secondary">
          <ArrowLeft size={18} className="mr-2" />
          Retour aux cours
        </button>
      </div>
    );
  }

  // Remove marked.parse(), just sanitize HTML directly
  const sanitizedHtml = DOMPurify.sanitize(course.content || '');

  const formatDate = (dateString) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
      });
  };

  return (
    <div className={`${styles.courseViewer} main-content p-8`}>
      <div className="mb-6">
        <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          <ArrowLeft size={18} />
          <span>Retour aux cours</span>
        </button>
      </div>

      <div className="mb-8 border-b border-[var(--border)] pb-6">
        <h1 className="text-3xl font-bold mb-4 text-[var(--text-main)]">{course.title}</h1>
        <div className="flex gap-6 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><Tag size={16} />{subjectName}</span>
          <span className="flex items-center gap-1.5"><Clock size={16} />Modifié le {formatDate(course.updated_at)}</span>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-8 shadow-sm">
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  );
};

export default CourseViewer;
