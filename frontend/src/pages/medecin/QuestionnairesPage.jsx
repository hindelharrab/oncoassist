import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  Plus, Edit3, Trash2, X, ClipboardList,
  AlertTriangle, HelpCircle, Sparkles
} from 'lucide-react';

import { useQuestionnaire } from '../../context/QuestionnaireContext';

// ─── Design tokens ───────────────────────────────────────────────────────────
const palette = {
  lavender:  { bg: '#F0EEFF', text: '#6C5CE7', border: '#D4CCFF' },
  mint:      { bg: '#E6FFF6', text: '#00B894', border: '#ADEFDA' },
  peach:     { bg: '#FFF3EB', text: '#E17055', border: '#FECFB6' },
  rose:      { bg: '#FFF0F3', text: '#E84393', border: '#FFB8D0' },
  sky:       { bg: '#EBF6FF', text: '#0984E3', border: '#BDDEFF' },
  butter:    { bg: '#FFFCE6', text: '#FDCB6E', border: '#FDEEB8' },
};

const typeColor = { unique: palette.sky, multiple: palette.lavender };

// ─── Animated pill badge ─────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const col = typeColor[type] || palette.sky;
  return (
    <motion.span
      layout
      style={{
        background: col.bg,
        color: col.text,
        border: `1px solid ${col.border}`,
        borderRadius: 20,
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: '0.12em',
        padding: '3px 10px',
        textTransform: 'uppercase',
      }}
    >
      {type === 'multiple' ? '✦ Multiple' : '◉ Unique'}
    </motion.span>
  );
};

// ─── Floating dot decoration ─────────────────────────────────────────────────
const Dot = ({ style }) => (
  <motion.div
    animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
    style={{ borderRadius: '50%', position: 'absolute', pointerEvents: 'none', ...style }}
  />
);

// ─── Question card ────────────────────────────────────────────────────────────
const QuestionCard = ({ q, idx, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const colors = [palette.lavender, palette.mint, palette.peach, palette.rose, palette.sky, palette.butter];
  const accent = colors[idx % colors.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: idx * 0.06 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        background: '#fff',
        border: `1.5px solid ${hovered ? accent.border : '#F0EEF8'}`,
        borderRadius: 20,
        padding: '22px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hovered
          ? `0 8px 32px 0 ${accent.bg}cc, 0 2px 8px 0 #0001`
          : '0 2px 8px 0 #0000000a',
        overflow: 'hidden',
      }}
    >
      {/* Accent stripe */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.4, scaleY: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 4, borderRadius: '0 4px 4px 0',
          background: accent.text,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#C0BAD8', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Q{idx + 1}
          </span>
          <TypeBadge type={q.type} />
        </div>

        {/* Action buttons */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              style={{ display: 'flex', gap: 4 }}
            >
              <motion.button
                whileHover={{ scale: 1.12, background: '#F0EEFF' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(q)}
                style={{
                  border: 'none', background: '#F7F5FF', borderRadius: 10,
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#6C5CE7',
                }}
              >
                <Edit3 size={13} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.12, background: '#FFF0F3' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(q)}
                style={{
                  border: 'none', background: '#FFF5F7', borderRadius: 10,
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#E84393',
                }}
              >
                <Trash2 size={13} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Question text */}
      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#2D2640', lineHeight: 1.55, margin: 0 }}>
        {q.text}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {q.options.map((opt, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            style={{
              background: accent.bg,
              color: accent.text,
              border: `1px solid ${accent.border}`,
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              padding: '4px 11px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 8 }}>{q.type === 'multiple' ? '□' : '◦'}</span>
            {opt}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Input / Textarea shared style ──────────────────────────────────────────
const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  background: '#FAF8FF',
  border: '1.5px solid #EAE5FF',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 500,
  color: '#2D2640',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit',
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const QuestionnairesPage = () => {
  const { globalQuestions, addGlobalQuestion, deleteGlobalQuestion, updateGlobalQuestion } = useQuestionnaire();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const [formText, setFormText] = useState('');
  const [formType, setFormType] = useState('unique');
  const [formOptions, setFormOptions] = useState(['', '']);

  const openAddModal = () => {
    setCurrentQuestion(null);
    setFormText('');
    setFormType('unique');
    setFormOptions(['', '']);
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setCurrentQuestion(q);
    setFormText(q.text);
    setFormType(q.type || 'unique');
    setFormOptions(q.options);
    setIsModalOpen(true);
  };

  const handleAddOption = () => setFormOptions([...formOptions, '']);
  const handleRemoveOption = (index) => {
    if (formOptions.length > 1) setFormOptions(formOptions.filter((_, i) => i !== index));
  };

  const handleSaveQuestion = () => {
    if (!formText.trim()) return;
    const filteredOptions = formOptions.filter(o => o.trim() !== '');
    if (currentQuestion) {
      updateGlobalQuestion(currentQuestion.id, { text: formText, type: formType, options: filteredOptions });
    } else {
      addGlobalQuestion({ text: formText, type: formType, options: filteredOptions });
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (q) => {
    setQuestionToDelete(q);
    setIsDeleteModalOpen(true);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #F8F5FF 0%, #FFF5FB 50%, #F0F8FF 100%)',
      padding: '12px',
      fontFamily: "'DM Sans', 'Nunito', system-ui, sans-serif",
    }}>

      {/* Card container */}
      <div style={{
        background: '#fff',
        borderRadius: 24,
        border: '1.5px solid #EDE8FF',
        boxShadow: '0 4px 40px 0 #6C5CE710',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Decorative dots */}
        <Dot style={{ width: 80, height: 80, background: '#F0EEFF', top: -20, right: 60 }} />
        <Dot style={{ width: 40, height: 40, background: '#FFF0F3', top: 40, right: 20 }} />

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1.5px solid #F3EFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #F0EEFF, #EBF6FF)',
                border: '1.5px solid #D4CCFF',
                borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6C5CE7',
              }}
            >
              <ClipboardList size={22} />
            </motion.div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#2D2640', letterSpacing: '-0.03em' }}>
                Questionnaires Globaux
              </h1>
              <p style={{ margin: '3px 0 0', fontSize: 11, fontWeight: 600, color: '#B0A8CC', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Questions assignées à tous vos patients
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 8px 24px #6C5CE740' }}
            whileTap={{ scale: 0.96 }}
            onClick={openAddModal}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 16px #6C5CE730',
            }}
          >
            <Plus size={15} /> Nouvelle question
          </motion.button>
        </div>

        {/* ── Stats bar ───────────────────────────────────────── */}
        <div style={{
          padding: '10px 32px',
          background: 'linear-gradient(90deg, #FAF8FF, #FFF8FC)',
          borderBottom: '1.5px solid #F3EFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: '#00B894' }}
            />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#B0A8CC', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {globalQuestions.length} question{globalQuestions.length !== 1 ? 's' : ''} active{globalQuestions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[palette.lavender, palette.mint, palette.rose].map((c, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c.text, opacity: 0.4 }} />
            ))}
          </div>
        </div>

        {/* ── Questions grid ──────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            <AnimatePresence>
              {globalQuestions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  idx={idx}
                  onEdit={openEditModal}
                  onDelete={confirmDelete}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {globalQuestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '80px 0', gap: 16,
              }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: 'linear-gradient(135deg, #F0EEFF, #FFF0F3)',
                  border: '1.5px solid #EAE5FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#C0BAD8',
                }}
              >
                <HelpCircle size={36} />
              </motion.div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#C0BAD8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Aucune question globale configurée
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#D0C8E8' }}>
                Commencez par créer votre première question ✨
              </p>
            </motion.div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div style={{
          padding: '10px 32px',
          borderTop: '1.5px solid #F3EFFF',
          background: '#FDFCFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Sparkles size={10} style={{ color: '#C0BAD8' }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: '#C0BAD8', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Système Unifié — tout changement affecte l'ensemble des dossiers patients
          </span>
          <Sparkles size={10} style={{ color: '#C0BAD8' }} />
        </div>
      </div>

      {/* ══ CREATE / EDIT MODAL ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(44,38,64,0.55)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 520,
                maxHeight: '88vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                borderRadius: 24,
                boxShadow: '0 32px 80px #6C5CE725, 0 4px 16px #0000001a',
                overflow: 'hidden',
                border: '1.5px solid #EAE5FF',
              }}
            >
              {/* Modal header */}
              <div style={{
                padding: '24px 28px 20px',
                borderBottom: '1.5px solid #F3EFFF',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #FAF8FF, #FFF8FC)',
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#2D2640', letterSpacing: '-0.02em' }}>
                    {currentQuestion ? '✏️ Modifier la question' : '✨ Créer une question'}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 600, color: '#B0A8CC', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Visible pour tous les patients
                  </p>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, background: '#F0EEFF' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    border: 'none', background: '#F7F5FF', borderRadius: 12,
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#6C5CE7', flexShrink: 0, transition: 'background 0.2s',
                  }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* Modal body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Type selector */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#B0A8CC', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Type de réponse
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['unique', 'multiple'].map(t => (
                      <motion.button
                        key={t}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFormType(t)}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          borderRadius: 12,
                          border: formType === t ? '1.5px solid #A29BFE' : '1.5px solid #EAE5FF',
                          background: formType === t
                            ? 'linear-gradient(135deg, #F0EEFF, #EBF6FF)'
                            : '#FAF8FF',
                          color: formType === t ? '#6C5CE7' : '#B0A8CC',
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t === 'unique' ? '◉ Choix unique' : '□ Choix multiple'}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Question text */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#B0A8CC', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Texte de la question
                  </label>
                  <textarea
                    value={formText}
                    onChange={e => setFormText(e.target.value)}
                    placeholder="Saisissez votre question..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={e => { e.target.style.borderColor = '#A29BFE'; e.target.style.boxShadow = '0 0 0 3px #A29BFE20'; }}
                    onBlur={e => { e.target.style.borderColor = '#EAE5FF'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Options */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#B0A8CC', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Choix de réponses
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAddOption}
                      style={{
                        border: 'none', background: '#F0EEFF',
                        color: '#6C5CE7', borderRadius: 10,
                        padding: '5px 12px', fontSize: 10,
                        fontWeight: 800, letterSpacing: '0.1em',
                        textTransform: 'uppercase', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: 'inherit',
                      }}
                    >
                      <Plus size={11} /> Ajouter
                    </motion.button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <AnimatePresence>
                      {formOptions.map((opt, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 12, height: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <span style={{ fontSize: 13, color: '#C0BAD8', flexShrink: 0 }}>
                            {formType === 'multiple' ? '□' : '◦'}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const n = [...formOptions];
                              n[i] = e.target.value;
                              setFormOptions(n);
                            }}
                            placeholder={`Choix ${i + 1}`}
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={e => { e.target.style.borderColor = '#A29BFE'; e.target.style.boxShadow = '0 0 0 3px #A29BFE20'; }}
                            onBlur={e => { e.target.style.borderColor = '#EAE5FF'; e.target.style.boxShadow = 'none'; }}
                          />
                          <motion.button
                            whileHover={{ scale: 1.1, background: '#FFF0F3' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveOption(i)}
                            style={{
                              border: 'none', background: '#FFF5F7',
                              borderRadius: 10, width: 30, height: 30, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', color: '#E84393', transition: 'background 0.15s',
                            }}
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div style={{
                padding: '18px 28px',
                borderTop: '1.5px solid #F3EFFF',
                background: '#FAF8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 12,
              }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: 'none', border: 'none',
                    fontSize: 11, fontWeight: 700, color: '#B0A8CC',
                    cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: 'inherit',
                  }}
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 24px #6C5CE740' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveQuestion}
                  style={{
                    padding: '11px 26px',
                    background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px #6C5CE730',
                    fontFamily: 'inherit',
                  }}
                >
                  {currentQuestion ? '✓ Mettre à jour' : '✨ Créer'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ DELETE MODAL ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(44,38,64,0.65)', backdropFilter: 'blur(10px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 360,
                background: '#fff',
                borderRadius: 24,
                padding: '36px 32px 28px',
                textAlign: 'center',
                border: '1.5px solid #FFB8D0',
                boxShadow: '0 32px 80px #E8439320, 0 4px 16px #0000001a',
              }}
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  width: 64, height: 64,
                  background: 'linear-gradient(135deg, #FFF0F3, #FFF5E6)',
                  border: '1.5px solid #FFB8D0',
                  borderRadius: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#E84393',
                }}
              >
                <AlertTriangle size={28} />
              </motion.div>

              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#2D2640', letterSpacing: '-0.02em' }}>
                Supprimer cette question ?
              </h3>
              <p style={{ margin: '0 0 28px', fontSize: 12, color: '#B0A8CC', lineHeight: 1.6 }}>
                Cette question sera supprimée pour{' '}
                <strong style={{ color: '#E84393' }}>TOUS</strong>{' '}
                les patients et ne pourra pas être récupérée.
              </p>

              <div style={{ display: 'flex', gap: 10 }}>
                <motion.button
                  whileHover={{ background: '#FAF8FF' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: '#F7F5FF',
                    border: '1.5px solid #EAE5FF',
                    borderRadius: 14,
                    fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#B0A8CC', cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'background 0.2s',
                  }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 24px #E8439340' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    deleteGlobalQuestion(questionToDelete.id);
                    setIsDeleteModalOpen(false);
                  }}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: 'linear-gradient(135deg, #E84393, #FF7EB3)',
                    border: 'none',
                    borderRadius: 14,
                    fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: '#fff', cursor: 'pointer',
                    boxShadow: '0 4px 16px #E8439330',
                    fontFamily: 'inherit',
                  }}
                >
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionnairesPage;
