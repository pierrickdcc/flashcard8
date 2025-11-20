import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDataSync } from '../context/DataSyncContext';
import SubjectCombobox from './SubjectCombobox';
import Modal from './Modal'; // New Premium Modal

const AddContentModal = ({ isOpen, onClose, cardToEdit, courseToEdit }) => {
  const { subjects, addCard, updateCard, handleBulkAdd, addCourse, updateCourse, addSubject } = useDataSync();

  const [activeTab, setActiveTab] = useState('flashcard');
  const [flashcardMode, setFlashcardMode] = useState('single');

  // Fields for single flashcard
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [answerImage, setAnswerImage] = useState('');

  // Field for bulk flashcards
  const [bulkText, setBulkText] = useState('');

  // Fields for course
  const [courseTitle, setCourseTitle] = useState('');
  const [courseContent, setCourseContent] = useState('');
  const [courseSubjectId, setCourseSubjectId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (cardToEdit) {
        setActiveTab('flashcard');
        setFlashcardMode('single');
        setQuestion(cardToEdit.question || '');
        setAnswer(cardToEdit.answer || '');
        setSubjectId(cardToEdit.subject_id || '');
        setQuestionImage(cardToEdit.question_image || '');
        setAnswerImage(cardToEdit.answer_image || '');
      } else if (courseToEdit) {
        setActiveTab('course');
        setCourseTitle(courseToEdit.title || '');
        setCourseContent(courseToEdit.content || '');
        setCourseSubjectId(courseToEdit.subject_id || '');
      } else {
        resetAllFields();
      }
    }
  }, [isOpen, cardToEdit, courseToEdit]);

  const resetAllFields = () => {
    setQuestion('');
    setAnswer('');
    setQuestionImage('');
    setAnswerImage('');
    setBulkText('');
    setCourseTitle('');
    setCourseContent('');
    if (subjects && subjects.length > 0) {
      setSubjectId(subjects[0].id);
      setCourseSubjectId(subjects[0].id);
    } else {
      setSubjectId('');
      setCourseSubjectId('');
    }
  };

  const handleSubjectChange = async (value) => {
    if (typeof value === 'string' && !subjects.find(s => s.id === value)) {
      await addSubject(value);
      const newSubject = subjects.find(s => s.name.toLowerCase() === value.toLowerCase());
      if (newSubject) {
        if (activeTab === 'flashcard') {
          setSubjectId(newSubject.id);
        } else {
          setCourseSubjectId(newSubject.id);
        }
      }
    } else {
      if (activeTab === 'flashcard') {
        setSubjectId(value);
      } else {
        setCourseSubjectId(value);
      }
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        if (type === 'question') {
          setQuestionImage(base64String);
        } else {
          setAnswerImage(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSingleCardSubmit = () => {
    if (!question.trim() || !answer.trim() || !subjectId) {
      toast.error('La question, la réponse et la matière sont obligatoires.');
      return;
    }
    const cardData = { 
      question: question.trim(), 
      answer: answer.trim(), 
      subject_id: subjectId,
      question_image: questionImage || null,
      answer_image: answerImage || null,
    };
    if (cardToEdit) {
      updateCard(cardToEdit.id, cardData);
    } else {
      addCard(cardData);
    }
    onClose();
  };

  const handleBulkAddSubmit = () => {
    if (!bulkText.trim()) {
      toast.error('Le champ ne peut pas être vide.');
      return;
    }
    handleBulkAdd(bulkText);
    onClose();
  };

  const handleCourseSubmit = () => {
    if (!courseTitle.trim() || !courseContent.trim() || !courseSubjectId) {
      toast.error('Le titre, le contenu et la matière sont obligatoires.');
      return;
    }
    const courseData = { title: courseTitle.trim(), content: courseContent.trim(), subject_id: courseSubjectId };
    if (courseToEdit) {
      updateCourse(courseToEdit.id, courseData);
    } else {
      addCourse(courseData);
    }
    onClose();
  };

  const handleSubmit = () => {
    if (activeTab === 'flashcard') {
      if (flashcardMode === 'single') {
        handleSingleCardSubmit();
      } else {
        handleBulkAddSubmit();
      }
    } else {
      handleCourseSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cardToEdit ? "Modifier la Flashcard" : courseToEdit ? "Modifier le Cours" : "Ajouter du contenu"}
    >
      <div className="flex flex-col gap-6">
        {/* Top Tabs (Only if not editing specific item) */}
        {!cardToEdit && !courseToEdit && (
          <div className="flex p-1 bg-[var(--bg-body)] rounded-xl border border-[var(--border)]">
            <button
              onClick={() => setActiveTab('flashcard')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
              ${activeTab === 'flashcard' ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              <Plus size={16} /> Flashcard
            </button>
            <button
              onClick={() => setActiveTab('course')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all
              ${activeTab === 'course' ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              <BookOpen size={16} /> Cours
            </button>
          </div>
        )}

        {activeTab === 'flashcard' && (
          <div className="flex flex-col gap-4">
            {!cardToEdit && (
               <div className="flex gap-4 mb-2">
                <button
                  onClick={() => setFlashcardMode('single')}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${flashcardMode === 'single' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
                >
                  Unique
                </button>
                <button
                  onClick={() => setFlashcardMode('bulk')}
                   className={`text-sm font-medium pb-1 border-b-2 transition-colors ${flashcardMode === 'bulk' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
                >
                  En masse
                </button>
              </div>
            )}

            {flashcardMode === 'single' ? (
              <div className="space-y-4">
                 {/* Subject Selection */}
                 <div className="form-group">
                  <label className="label text-sm font-medium mb-1.5 block text-[var(--text-muted)]">Matière</label>
                  <SubjectCombobox
                    subjects={subjects || []}
                    selectedSubject={subjectId}
                    setSelectedSubject={handleSubjectChange}
                  />
                </div>

                {/* Question */}
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="front" className="label text-sm font-medium text-[var(--text-muted)]">Question (Recto)</label>
                    <label className="text-xs text-[var(--primary)] cursor-pointer flex items-center gap-1 hover:underline">
                      <ImageIcon size={12} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'question')}
                        className="hidden"
                      />
                      {questionImage ? 'Changer image' : 'Ajouter image'}
                    </label>
                  </div>
                  <textarea
                    id="front"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ex: Quelle est la capitale de la France ?"
                    className="textarea w-full bg-[var(--bg-body)] border-[var(--border)] rounded-lg p-3 min-h-[80px] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                  />
                  {questionImage && (
                    <div className="relative mt-2 inline-block group">
                      <img src={questionImage} alt="Question" className="h-20 w-auto rounded-md border border-[var(--border)]" />
                      <button
                        onClick={() => setQuestionImage('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Answer */}
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="back" className="label text-sm font-medium text-[var(--text-muted)]">Réponse (Verso)</label>
                    <label className="text-xs text-[var(--primary)] cursor-pointer flex items-center gap-1 hover:underline">
                      <ImageIcon size={12} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'answer')}
                        className="hidden"
                      />
                      {answerImage ? 'Changer image' : 'Ajouter image'}
                    </label>
                  </div>
                  <textarea 
                    id="back"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Ex: Paris"
                    className="textarea w-full bg-[var(--bg-body)] border-[var(--border)] rounded-lg p-3 min-h-[80px] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                  />
                  {answerImage && (
                     <div className="relative mt-2 inline-block group">
                      <img src={answerImage} alt="Answer" className="h-20 w-auto rounded-md border border-[var(--border)]" />
                      <button
                        onClick={() => setAnswerImage('')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-[var(--bg-body)] rounded-lg border border-[var(--border)] text-xs text-[var(--text-muted)]">
                  <p>Format : <code className="text-[var(--primary)]">Question # Réponse # Matière</code></p>
                  <p className="mt-1">Une carte par ligne.</p>
                </div>
                <textarea 
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Capitale de la France # Paris # Géographie&#10;Symbole de l'or # Au # Chimie"
                  className="textarea w-full bg-[var(--bg-body)] border-[var(--border)] rounded-lg p-3 min-h-[200px] font-mono text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'course' && (
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label text-sm font-medium mb-1.5 block text-[var(--text-muted)]">Matière</label>
              <SubjectCombobox
                subjects={subjects || []}
                selectedSubject={courseSubjectId}
                setSelectedSubject={handleSubjectChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-title" className="label text-sm font-medium mb-1.5 block text-[var(--text-muted)]">Titre du cours</label>
              <input
                id="course-title"
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Ex: Introduction à la biologie"
                className="input w-full bg-[var(--bg-body)] border-[var(--border)] rounded-lg p-3 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="form-group">
              <label htmlFor="course-content" className="label text-sm font-medium mb-1.5 block text-[var(--text-muted)]">Contenu</label>
              <textarea
                id="course-content"
                value={courseContent}
                onChange={(e) => setCourseContent(e.target.value)}
                placeholder="# Titre principal&#10;&#10;## Sous-titre&#10;&#10;Votre contenu ici... (Markdown supporté)"
                className="textarea w-full bg-[var(--bg-body)] border-[var(--border)] rounded-lg p-3 min-h-[250px] font-mono text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[var(--text-muted)] hover:bg-white/5 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-[var(--primary-gradient)] text-white font-medium shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all"
          >
            {cardToEdit || courseToEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddContentModal;
