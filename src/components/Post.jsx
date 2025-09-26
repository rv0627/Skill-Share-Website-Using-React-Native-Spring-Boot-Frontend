const Post = ({ post }) => {
    const [reactions, setReactions] = useState(post.reactions || {
      love: 0,
      funny: 0,
      wow: 0,
      sad: 0,
      angry: 0,
    });
  
    const [userReaction, setUserReaction] = useState(post.userReaction || null);
    const [showComments, setShowComments] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
  
    const emojiMap = {
      love: "❤️",
      funny: "😂",
      wow: "😮",
      sad: "😢",
      angry: "😡",
    };
  
    const handleReaction = (type) => {
      if (userReaction === type) {
        setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
        setUserReaction(null);
      } else {
        setReactions((prev) => {
          const updated = { ...prev };
          if (userReaction) {
            updated[userReaction] = Math.max(updated[userReaction] - 1, 0);
          }
          updated[type] += 1;
          return updated;
        });
        setUserReaction(type);
      }
    };
  
    return (
      <div className="bg-white p-4 rounded-2xl shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <img src={post.userAvatar || userLogo} alt="user" className="w-10 h-10 rounded-full" />
          <div>
            <h3 className="font-semibold">{post.userName || "Unknown"}</h3>
            <p className="text-xs text-gray-400">{post.time || "Just now"}</p>
          </div>
        </div>
  
        <p className="mb-3">{post.content}</p>
  
        <img
          src={post.image}
          alt="post"
          onClick={() => setShowFullImage(true)}
          className="rounded-lg w-full max-h-[400px] object-cover mb-4 cursor-pointer hover:opacity-90"
        />
  
        {/* Emoji Reactions */}
        <div className="flex items-center gap-3 text-2xl text-gray-700 mb-2">
          {Object.keys(emojiMap).map((type) => (
            <span
              key={type}
              className={`cursor-pointer ${
                userReaction === type ? "scale-125 text-blue-600" : "hover:scale-110"
              } transition`}
              onClick={() => handleReaction(type)}
              title={`${reactions[type]} reacted with ${emojiMap[type]}`}
            >
              {emojiMap[type]} <span className="text-sm">{reactions[type]}</span>
            </span>
          ))}
          <span
            className="text-lg cursor-pointer ml-auto text-gray-500"
            onClick={() => setShowComments(true)}
          >
            💬 {post.comments?.length || 0} Comments
          </span>
        </div>
  
        {/* Comments */}
        {showComments && post.comments && (
          <div className="mt-3 border-t pt-2 text-sm text-gray-600">
            {post.comments.map((c, idx) => (
              <p key={idx}><strong>{c.name}:</strong> {c.text}</p>
            ))}
          </div>
        )}
  
        {/* Full Image Modal */}
        {showFullImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <img
              src={post.image}
              alt="Full Post"
              className="max-w-full max-h-[90vh] rounded-xl"
              onClick={() => setShowFullImage(false)}
            />
          </div>
        )}
      </div>
    );
  };
  