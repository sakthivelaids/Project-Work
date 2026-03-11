import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courseAPI, lessonAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/UI';

const CATEGORIES = ['Web Development', 'Data Science', 'Design', 'Mobile', 'DevOps', 'Marketing', 'Business', 'Photography', 'Music', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function AddCourse() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '', description: '', category: '', thumbnail: '', price: '', level: 'Beginner', duration: '', is_published: true
  });
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lessonModal, setLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: '', video_url: '', content: '', duration: '', order_index: 0 });
  const [courseId, setCourseId] = useState(id || null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isEdit) {
      courseAPI.getById(id).then(res => {
        const c = res.data.course;
        setForm({ title: c.title, description: c.description || '', category: c.category, thumbnail: c.thumbnail || '', price: c.price || '', level: c.level, duration: c.duration || '', is_published: c.is_published });
        setLessons(res.data.lessons || []);
        setCourseId(id);
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category) return addToast('Title and category are required', 'error');
    setLoading(true);
    try {
      if (isEdit) {
        await courseAPI.update(id, form);
        addToast('Course updated!', 'success');
        navigate('/instructor');
      } else {
        const res = await courseAPI.create(form);
        setCourseId(res.data.course.id);
        addToast('Course created! Now add some lessons.', 'success');
        setStep(2);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving course', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = async () => {
    if (!lessonForm.title) return addToast('Lesson title is required', 'error');
    try {
      const res = await lessonAPI.add({ ...lessonForm, course_id: courseId, order_index: lessons.length });
      setLessons(prev => [...prev, res.data.lesson]);
      setLessonForm({ title: '', video_url: '', content: '', duration: '', order_index: 0 });
      setLessonModal(false);
      addToast('Lesson added!', 'success');
    } catch (err) {
      addToast('Failed to add lesson', 'error');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await lessonAPI.delete(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      addToast('Lesson removed.', 'success');
    } catch (err) {
      addToast('Failed to remove lesson', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700,
                  background: step >= s ? 'var(--accent)' : 'var(--bg-hover)',
                  color: step >= s ? '#fff' : 'var(--text-muted)'
                }}>{s}</div>
                <span style={{ fontSize: '0.85rem', color: step === s ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === s ? 600 : 400 }}>
                  {s === 1 ? 'Course Details' : 'Add Lessons'}
                </span>
                {s < 2 && <span style={{ color: 'var(--border)', margin: '0 4px' }}>›</span>}
              </div>
            ))}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{isEdit ? 'Edit Course' : step === 1 ? 'Create New Course' : 'Add Lessons'}</h1>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input type="text" placeholder="e.g. Complete React.js Bootcamp" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe what students will learn..." rows={4} style={{ resize: 'vertical' }} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input type="number" min="0" step="0.01" placeholder="0 for free" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input type="text" placeholder="e.g. 8 hours" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input type="url" placeholder="https://example.com/image.jpg" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
                {form.thumbnail && <img src={form.thumbnail} alt="" style={{ marginTop: '8px', borderRadius: '8px', width: '200px', aspectRatio: '16/9', objectFit: 'cover' }} />}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/instructor')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : isEdit ? 'Update Course' : 'Create & Add Lessons →'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px' }}>
            <div className="flex-between mb-16">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Course Lessons ({lessons.length})</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setLessonModal(true)}>+ Add Lesson</button>
            </div>

            {lessons.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <div className="lesson-num">{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{lesson.title}</div>
                      {lesson.duration && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱️ {lesson.duration}</div>}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteLesson(lesson.id)} style={{ color: 'var(--danger)' }}>🗑️</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
                No lessons yet. Add your first lesson!
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-success" onClick={() => navigate('/instructor')}>Finish ✓</button>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      <Modal isOpen={lessonModal} onClose={() => setLessonModal(false)} title="Add Lesson"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setLessonModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddLesson}>Add Lesson</button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Lesson Title *</label>
            <input type="text" placeholder="e.g. Introduction to React" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Video URL</label>
            <input type="url" placeholder="https://youtube.com/..." value={lessonForm.video_url} onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input type="text" placeholder="e.g. 15 min" value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Content / Notes</label>
            <textarea value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="Lesson content or description..." rows={3} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
