import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataSync } from '../context/DataSyncContext';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
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
    // ... (JSX pour cours non trouvé) ...
  }

  const sanitizedHtml = DOMPurify.sanitize(marked.parse(course.content || ''));

  const formatDate = (dateString) => {
    // ... (formatage de la date) ...
  };

  return (
    <div className={`${styles.courseViewer} main-content`}>
      <div className="mb-6">
        <button onClick={() => navigate('/courses')} className="btn btn-secondary">
          <ArrowLeft size={18} />
          <span>Retour aux cours</span>
        </button>
      </div>

      <div className={styles.courseViewerHeader}>
        <h1>{course.title}</h1>
        <div className={styles.courseViewerMeta}>
          <span className="flex items-center gap-1.5"><Tag size={16} />{subjectName}</span>
          <span className="flex items-center gap-1.5"><Clock size={16} />Dernière modification : {formatDate(course.updated_at)}</span>
        </div>
      </div>

      <div className={styles.courseViewerContent}>
        <div
          className={styles.courseContent}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  );
};

export default CourseViewer;
