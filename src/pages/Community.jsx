import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiPlus, FiX, FiUpload, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getCommunityFeed, createCommunityPost, likeCommunityPost, commentOnPost } from '../services/extraApi';
import { useAuth } from '../context/AuthContext';
import './Community.css';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [openComments, setOpenComments] = useState(null);
  const [commentText, setCommentText] = useState('');

  const loadFeed = () => {
    setLoading(true);
    getCommunityFeed()
      .then((res) => setPosts(res.data))
      .catch(() => toast.error('Could not load the feed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFeed(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Add a photo first');
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('image', image);
      data.append('caption', caption);
      await createCommunityPost(data);
      toast.success('Posted to the feed!');
      setShowForm(false);
      setCaption('');
      setImage(null);
      loadFeed();
    } catch (err) {
      toast.error('Could not create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) return toast.error('Sign in to like posts');
    try {
      const res = await likeCommunityPost(id);
      setPosts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, likes: Array(res.data.likes).fill(null) } : p))
      );
    } catch (err) {
      toast.error('Could not like post');
    }
  };

  const handleComment = async (id) => {
    if (!user) return toast.error('Sign in to comment');
    if (!commentText.trim()) return;
    try {
      const comments = await commentOnPost(id, commentText);
      setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, comments: comments.data } : p)));
      setCommentText('');
    } catch (err) {
      toast.error('Could not post comment');
    }
  };

  return (
    <div className="page-wrap community-page">
      <div className="container">
        <div className="community-head">
          <div>
            <span className="eyebrow">Real people, real outfits</span>
            <h1 className="community-title">Fashion feed</h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus size={16} /> Share your outfit
          </button>
        </div>

        {loading ? (
          <div className="spinner" style={{ margin: '60px auto' }} />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to share how you styled something from StyleHub.</p>
          </div>
        ) : (
          <div className="community-grid">
            {posts.map((post) => (
              <div key={post._id} className="community-card">
                <img src={post.image} alt={post.caption || 'Outfit'} className="community-image" />
                <div className="community-card-body">
                  <div className="community-card-user">
                    <span className="community-avatar">{post.userId?.name?.[0] || '?'}</span>
                    <strong>{post.userId?.name || 'StyleHub member'}</strong>
                  </div>
                  {post.caption && <p className="community-caption">{post.caption}</p>}

                  {post.taggedProducts?.length > 0 && (
                    <div className="community-tags">
                      {post.taggedProducts.map((p) => (
                        <Link key={p._id} to={`/products/${p._id}`} className="tag tag-blush">{p.name}</Link>
                      ))}
                    </div>
                  )}

                  <div className="community-actions">
                    <button onClick={() => handleLike(post._id)}>
                      <FiHeart size={16} /> {post.likes?.length || 0}
                    </button>
                    <button onClick={() => setOpenComments(openComments === post._id ? null : post._id)}>
                      <FiMessageCircle size={16} /> {post.comments?.length || 0}
                    </button>
                  </div>

                  {openComments === post._id && (
                    <div className="community-comments">
                      {post.comments?.map((c, i) => (
                        <div key={i} className="community-comment">
                          <strong>{c.userId?.name || 'User'}</strong> {c.text}
                        </div>
                      ))}
                      <div className="community-comment-input">
                        <input
                          type="text"
                          placeholder="Add a comment…"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                        />
                        <button onClick={() => handleComment(post._id)}><FiSend size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="seller-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="seller-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <button className="seller-modal-close" onClick={() => setShowForm(false)}><FiX size={20} /></button>
            <h2>Share your outfit</h2>
            <form onSubmit={handlePost}>
              <div className="field">
                <label htmlFor="community-image">Photo</label>
                <label className="seller-upload-box">
                  <FiUpload size={18} />
                  <span>{image ? image.name : 'Click to upload a photo'}</span>
                  <input
                    id="community-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <div className="field">
                <label htmlFor="caption">Caption</label>
                <textarea
                  id="caption"
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="How'd you style it?"
                />
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post to feed'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
