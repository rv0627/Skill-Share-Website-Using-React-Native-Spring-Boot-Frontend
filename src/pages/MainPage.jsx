import React, { useEffect, useState } from "react";
import {
    FaSearch,
    FaBell,
    FaPlus,
    FaTimes,
    FaImage,
    FaVideo,
} from "react-icons/fa";
import userLogo from "../assets/userlogo.png";
import postImage from "../assets/post.jpg";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
dayjs.extend(relativeTime);


const MainPage = () => {


    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const navigate = useNavigate();


    const [showFullImage, setShowFullImage] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostText, setNewPostText] = useState("");
    const [newPostMedia, setNewPostMedia] = useState(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const [likes, setLikes] = useState(24); // initial like count
    const [liked, setLiked] = useState(false);

    const [userReaction, setUserReaction] = useState(null);

    const [isFollowing, setIsFollowing] = useState(false);
    const [caption, setCaption] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [posts, setPosts] = useState([]);

    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});

    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null); // Add this line

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [followingMap, setFollowingMap] = useState({});

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");


    const handleEditComment = async (commentId, initialContent) => {
        if (!commentId) {
            console.error("Invalid comment ID");
            return;
        }
        setEditingCommentId(commentId);
        setEditCommentText(initialContent);
    };


    const handleSaveEditedComment = async () => {
        if (!editingCommentId) {
            alert("No comment selected for editing");
            return;
        }

        if (!editCommentText.trim()) {
            alert("Comment cannot be empty");
            return;
        }

        try {
            await axios.put(`http://localhost:8080/api/comments/update?commentId=${editingCommentId}`, {
                postId: selectedPostId,
                userId: userId,
                content: editCommentText,
            });

            // Refresh comments
            fetchComments(selectedPostId);
            setEditingCommentId(null);
            setEditCommentText("");
        } catch (err) {
            console.error("Error updating comment:", err);
            alert("Failed to update comment");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await axios.delete(`http://localhost:8080/api/comments/delete?commentId=${commentId}`);
            // Decrement the comment count for the selected post
            setCommentCounts((prev) => ({
                ...prev,
                [selectedPostId]: Math.max((prev[selectedPostId] || 1) - 1, 0), // Ensure count doesn't go below 0
            }));
            // Refresh comments
            fetchComments(selectedPostId);
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert("Failed to delete comment");
        }
    };


    // Fetch users as you type
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/user/search?query=${searchTerm}`);
                setSearchResults(res.data);
            } catch (err) {
                console.error('Error searching users:', err);
            }
        }, 300); // debounce

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);



    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserId(parsedUser.id); // Set userId directly
            setUser(parsedUser);
            console.log("User Email:", parsedUser); // This will work
        } else {
            setUser(null);
        }
    }, []);


    //notification
    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/notifications?userId=${userId}`);
                setNotifications(res.data);

                const countRes = await axios.get(`http://localhost:8080/api/notifications/unread-count?userId=${userId}`);
                setUnreadCount(countRes.data);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        fetchNotifications();
    }, [userId]);

    const markNotificationsAsRead = async () => {
        try {
            await axios.post(`http://localhost:8080/api/notifications/mark-read?userId=${userId}`);
            setUnreadCount(0); // Reset the count
        } catch (err) {
            console.error("Failed to mark notifications as read", err);
        }
    };



    const [reactions, setReactions] = useState({
        love: 4,
        funny: 2,
        wow: 1,
        sad: 0,
        angry: 0,
    });

    const toggleLike = () => {
        setLiked(!liked);
        setLikes((prev) => (liked ? prev - 1 : prev + 1));
    };

    //const currentUserId = localStorage.getItem("userId"); // Make sure you store this on login

    const toggleFollow = async (post) => {
        const targetUserId = post.user.id;
        const isFollowing = followingMap[targetUserId] || false;

        const endpoint = isFollowing
            ? 'http://localhost:8080/api/follow/unfollow'
            : 'http://localhost:8080/api/follow/follow';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    followerId: userId,
                    followingId: targetUserId,
                }),
            });

            if (response.ok) {
                setFollowingMap(prev => ({
                    ...prev,
                    [targetUserId]: !isFollowing,
                }));

                // Optional: update counts
                if (targetUserId === userId) {
                    setFollowersCount(prev => prev + (isFollowing ? -1 : 1));
                } else {
                    setFollowingCount(prev => prev + (isFollowing ? -1 : 1));
                }

                // 👉 Only notify when it's a new follow, not unfollow
                if (!isFollowing) {
                    await fetch('http://localhost:8080/api/notifications', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            recipientId: targetUserId,
                            senderId: userId,
                            type: 'follow',
                            content: `${user?.fullName} started following you.`,
                        }),
                    });
                }

            } else {
                const error = await response.text();
                console.error('Follow/Unfollow failed:', error);
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    };


    useEffect(() => {
        const fetchCountsAndFollowing = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
                const userId = storedUser?.id;

                if (!userId) {
                    console.warn("User ID is null. Skipping fetch.");
                    return;
                }

                // Fetch followers and following lists
                const [followersRes, followingRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/follow/followers?userId=${userId}`),
                    fetch(`http://localhost:8080/api/follow/following?userId=${userId}`)
                ]);

                if (!followersRes.ok || !followingRes.ok) {
                    throw new Error("Unauthorized or failed request");
                }

                const followers = await followersRes.json();
                const following = await followingRes.json();

                // Set follower/following counts
                setFollowersCount(followers.length);
                setFollowingCount(following.length);

                // Set follow state for each followed user
                const map = {};
                following.forEach(user => {
                    map[user.id] = true; // Mark as already followed
                });

                setFollowingMap(map); // Set it globally
            } catch (error) {
                console.error("Failed to fetch follow data", error);
            }
        };

        fetchCountsAndFollowing();
    }, []);




    // useEffect(() => {
    //     const fetchCounts = async () => {
    //         try {
    //             const storedUser = JSON.parse(localStorage.getItem("user"));
    //             const userId = storedUser?.id;

    //             if (!userId) {
    //                 console.warn("User ID is null. Skipping fetch.");
    //                 return;
    //             }

    //             const [followersRes, followingRes] = await Promise.all([
    //                 fetch(`http://localhost:8080/api/follow/followers?userId=${userId}`),
    //                 fetch(`http://localhost:8080/api/follow/following?userId=${userId}`)
    //             ]);

    //             if (!followersRes.ok || !followingRes.ok) {
    //                 throw new Error("Unauthorized or failed request");
    //             }

    //             const followers = await followersRes.json();
    //             const following = await followingRes.json();

    //             setFollowersCount(followers.length);
    //             setFollowingCount(following.length);
    //         } catch (error) {
    //             console.error("Failed to fetch follow counts", error);
    //         }
    //     };

    //     fetchCounts();
    // }, []);

    // const handleFollow = async (targetUserId) => {
    //     await fetch(`http://localhost:8080/api/follow`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ followerId: user.id, followingId: targetUserId }),
    //     });

    //     setFollowingCount(prev => prev + 1);
    // };

    // const handleUnfollow = async (targetUserId) => {
    //     await fetch(`http://localhost:8080/api/unfollow`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ followerId: user.id, followingId: targetUserId }),
    //     });

    //     setFollowingCount(prev => prev - 1);
    // };


    const emojiMap = {
        love: "❤️",
        funny: "😂",
        wow: "😮",
        sad: "😢",
        angry: "😡",
    };

    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const updatedReactions = {};

                for (const post of posts) {
                    const response = await fetch(`http://localhost:8080/api/reactions?postId=${post.id}`);
                    const data = await response.json();
                    updatedReactions[post.id] = data;
                }

                setReactions(updatedReactions);
            } catch (error) {
                console.error("Error fetching reactions:", error);
            }
        };

        if (posts.length > 0) {
            fetchReactions();
        }
    }, [posts]);



    const handleReaction = async (postId, type) => {
        try {
            // Send the reaction to the backend
            await fetch("http://localhost:8080/api/reactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    postId,
                    userId,
                    type,
                }),
            });

            // Fetch the updated reactions count from the backend
            const updatedRes = await fetch(`http://localhost:8080/api/reactions?postId=${postId}`);
            const data = await updatedRes.json();

            // Update the UI with the new reaction count
            setReactions((prev) => {
                const updated = { ...prev };
                updated[postId] = data; // Replace reactions for the specific post

                return updated;
            });

            // Update the user's reaction state
            setUserReaction((prev) => ({ ...prev, [postId]: type }));

        } catch (error) {
            console.error("Reaction failed:", error);
        }
    };


    const [commentsMap, setCommentsMap] = useState({});
    // const [selectedPostId, setSelectedPostId] = useState(null);


    useEffect(() => {
        const fetchPostsAndComments = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/posts/all");
                const postsData = res.data;
                setPosts(postsData);
                fetchCommentCounts(postsData);
            } catch (err) {
                console.error("Error fetching posts:", err);
            }
        };

        fetchPostsAndComments();
    }, []);

    const fetchCommentCounts = async (postsList) => {
        try {
            const counts = {};
            for (const post of postsList) {
                const res = await axios.get(`http://localhost:8080/api/comments/count?postId=${post.id}`);
                counts[post.id] = res.data;
            }
            setCommentCounts(counts);
        } catch (err) {
            console.error("Failed to fetch comment counts", err);
        }
    };


    const fetchComments = async (postId) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/comments?postId=${postId}`);
            setComments(res.data);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        }
    };

    useEffect(() => {
        if (selectedPostId !== null) {
            fetchComments(selectedPostId);
        }
    }, [selectedPostId]);

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;

        try {
            await axios.post("http://localhost:8080/api/comments", {
                postId: selectedPostId,
                userId: userId,
                content: commentText
            });

            setCommentText("");
            fetchComments(selectedPostId); // refresh comments

            setCommentCounts(prev => ({
                ...prev,
                [selectedPostId]: (prev[selectedPostId] || 0) + 1
            }));
        } catch (err) {
            console.error("Error submitting comment", err);
        }
    };



    const handlePostSubmit = async () => {
        console.log("mediaFiles before upload:", mediaFiles);

        if (!caption.trim() && mediaFiles.length === 0) {
            alert("Please enter a caption or select media");
            return;
        }

        const formData = new FormData();
        formData.append("caption", newPostText);
        formData.append("userId", user.id);

        mediaFiles.forEach(file => {
            formData.append("mediaFiles", file);
        });

        try {
            const res = await axios.post("http://localhost:8080/api/posts/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.status === 200) {
                alert("Post uploaded!");
                setCaption("");
                setMediaFiles([]);
                setShowCreatePost(false);
            }
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        }
    };


    const [mediaReady, setMediaReady] = useState(true); // control readiness

    const handleMediaChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        for (let file of selectedFiles) {
            if (file.type.startsWith("video/")) {
                setMediaReady(false); // media not ready yet
                const video = document.createElement("video");
                video.preload = "metadata";

                video.onloadedmetadata = () => {
                    window.URL.revokeObjectURL(video.src);
                    if (video.duration > 30) {
                        alert("Video must be 30 seconds or less.");
                        setMediaReady(true);
                    } else {
                        setMediaFiles(prev => [...prev, file]);
                        setMediaReady(true); // ready after validation
                    }
                };

                video.src = URL.createObjectURL(file);
                return;
            }
        }

        // Only images selected
        const combined = [...mediaFiles, ...selectedFiles].slice(0, 3);
        setMediaFiles(combined);
        setMediaReady(true);
    };


    //const [posts, setPosts] = useState([]);
    const [postImage, setPostImage] = useState(""); // Add this

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/posts/all");
                console.log("Fetched posts:", res.data); // 👈 Add this

                setPosts(res.data);
            } catch (err) {
                console.error("Error fetching posts:", err);
            }
        };

        fetchPosts();
    }, []);


    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/"; // 👈 redirect after logout
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 z-20">
                <h1 className="text-2xl font-bold text-blue-600">SkillShare</h1>
                <div className="flex items-center gap-4 relative">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSearchResults(true);
                            }}
                            onFocus={() => setShowSearchResults(true)}
                            onBlur={() => setTimeout(() => setShowSearchResults(false), 100000)}
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-500" />

                        {/* Search Result Dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                            <div className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-xl z-30 max-h-60 overflow-y-auto">
                                {searchResults.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => navigate(`/profile/${u.id}`)}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <img src={`http://localhost:8080/uploads/${u.photo}`}
                                            alt="user" className="w-8 h-8 rounded-full" />
                                        <span className="text-sm font-medium">{u.fullName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notification */}
                    <div className="relative">
                        <FaBell
                            className="text-xl text-gray-600 cursor-pointer"
                            onClick={() => {
                                setNotificationsOpen(!notificationsOpen);
                                markNotificationsAsRead(); // mark as read when modal opens
                            }}
                        />
                        {unreadCount > 0 && (
                            <span className="cursor-pointer absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-xl z-30">
                                <div className="p-4 border-b font-semibold text-gray-700">
                                    Notifications
                                </div>
                                <ul className="max-h-60 overflow-y-auto text-sm">
                                    {notifications.length === 0 ? (
                                        <li className="px-4 py-2 text-gray-500 italic">No notifications yet.</li>
                                    ) : (
                                        notifications.map((n, index) => (
                                            <li key={index} className="px-4 py-2 hover:bg-gray-100">
                                                {n.content} <span className="text-xs text-gray-400">— {dayjs(n.timestamp).fromNow()}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row p-6 gap-6">
                {/* User Info */}
                {user && (
                    <div className="bg-white p-4 rounded-2xl shadow-md w-full md:w-1/4 text-center">
                        <img
                            src={`http://localhost:8080/uploads/${user.photo}`}
                            alt="profile"
                            className="w-24 h-24 mx-auto rounded-full border-4 border-blue-500 cursor-pointer"
                            onClick={() => navigate(`/profile/${user.id}`)}
                        />
                        <h2 className="mt-4 text-xl font-bold cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>{user.fullName}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>

                        {/* Active Now status */}
                        <p className="text-green-500 mt-2 font-medium">🟢 Active Now</p>

                        {/* Optional followers/following placeholders */}
                        <div className="mt-4 flex justify-around">
                            <div>
                                <p className="font-bold">-{followersCount}-</p>
                                <p className="text-sm text-gray-500">Followers</p>
                            </div>
                            <div>
                                <p className="font-bold">-{followingCount}-</p>
                                <p className="text-sm text-gray-500">Following</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                )}


                {/* Feed */}
                <div className="w-full md:w-3/4 space-y-6 max-h-[calc(100vh-150px)] overflow-y-auto pr-2">
                    {/* Sample Post */}
                    {Array.isArray(posts) && posts.map((post) => (
                        <div key={post.id} className="bg-white p-4 rounded-2xl shadow-md">
                            <div className="flex items-center gap-4 mb-4">
                                <img
                                    src={`http://localhost:8080/uploads/${post.user?.photo || userLogo}`}
                                    alt="user"
                                    className="w-10 h-10 rounded-full cursor-pointer"
                                    onClick={() => navigate(`/profile/${post.user.id}`)}
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold cursor-pointer" onClick={() => navigate(`/profile/${post.user.id}`)}>{post.user?.fullName || "Unknown User"}</h3>
                                        <button
                                            onClick={() => toggleFollow(post)}
                                            className={`text-sm px-2 py-1 rounded-full transition ${followingMap[post.user.id]
                                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                                }`}
                                        >
                                            {followingMap[post.user.id] ? "Following" : "Follow"}
                                        </button>



                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {dayjs(post.createdAt).fromNow()}
                                    </p>

                                </div>
                            </div>
                            <p className="mb-3">{post.caption}</p>
                            {post.mediaList?.length > 0 &&
                                post.mediaList.map((media, index) => (
                                    media.mediaType === "image" ? (
                                        <img
                                            key={index}
                                            src={`http://localhost:8080${media.mediaUrl}`}
                                            alt={`Post media ${index}`}
                                            onClick={() => {
                                                setPostImage(`http://localhost:8080${media.mediaUrl}`);
                                                setShowFullImage(true);
                                            }}
                                            className="rounded-lg w-full max-h-[400px] object-cover mb-4 cursor-pointer hover:opacity-90"
                                        />
                                    ) : (
                                        <video
                                            key={index}
                                            controls
                                            className="rounded-lg w-full max-h-[400px] object-cover mb-4"
                                        >
                                            <source src={`http://localhost:8080${media.mediaUrl}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )
                                ))
                            }

                            {/* Emoji Reactions */}
                            <div className="flex items-center gap-3 text-2xl text-gray-700 mb-2">
                                {Object.keys(emojiMap).map((type) => (
                                    <span
                                        key={type}
                                        className={`cursor-pointer ${userReaction?.[post.id] === type ? "scale-125 text-blue-600" : "hover:scale-110"
                                            } transition`}
                                        onClick={() => handleReaction(post.id, type)}
                                        title={`${reactions?.[post.id]?.[type] || 0} reacted with ${emojiMap[type]}`}
                                    >
                                        {emojiMap[type]} <span className="text-sm">{reactions?.[post.id]?.[type] || 0}</span>
                                    </span>
                                ))}



                                <span
                                    className="text-lg cursor-pointer ml-auto text-gray-500"
                                    onClick={() => {
                                        setSelectedPostId(post.id);
                                        setShowComments(true);
                                        fetchComments(post.id);
                                    }}
                                >
                                    💬 {commentCounts[post.id] || 0} Comments
                                </span>

                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Post Button */}
            <button
                onClick={() => setShowCreatePost(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-30"
            >
                <FaPlus />
            </button>

            {/* Full Image Modal */}
            {showFullImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
                    <img src={postImage} alt="full" className="max-h-[90vh] rounded-lg" />
                    <button
                        className="absolute top-6 right-6 text-white text-2xl"
                        onClick={() => setShowFullImage(false)}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* Comment Modal */}
            {showComments && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        {/* Close Button */}
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowComments(false)}
                        >
                            <FaTimes />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">Comments</h2>
                        <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                            {comments.length > 0 ? (
                                comments.map((c, i) => (
                                    <div key={i} className="flex justify-between items-center mb-2">
                                        <div>
                                            <strong>{c.username}:</strong> {c.content}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditComment(c.id, c.content)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(c.id)}
                                                className="text-red-600 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No comments yet.</p>
                            )}
                        </div>

                        {/* Single Input Field */}
                        <input
                            type="text"
                            value={editingCommentId ? editCommentText : commentText}
                            onChange={(e) => {
                                if (editingCommentId) {
                                    setEditCommentText(e.target.value);
                                } else {
                                    setCommentText(e.target.value);
                                }
                            }}
                            placeholder={editingCommentId ? "Edit your comment..." : "Type a comment..."}
                            className="w-full px-4 py-2 border rounded-lg mb-3"
                        />

                        {/* Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    if (editingCommentId) {
                                        setEditingCommentId(null);
                                        setEditCommentText("");
                                    } else {
                                        setShowComments(false);
                                        setSelectedPostId(null);
                                    }
                                }}
                                className="text-gray-600 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (editingCommentId) {
                                        handleSaveEditedComment();
                                    } else {
                                        handleCommentSubmit();
                                    }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                {editingCommentId ? "Save" : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Create Post Modal */}
            {showCreatePost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
                        <textarea
                            value={newPostText}
                            onChange={(e) => setNewPostText(e.target.value)}
                            placeholder="What's on your mind?"
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg mb-3"
                        />
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <FaImage className="text-blue-500" />
                                <span className="text-sm">Photo/Video</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleMediaChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <div className="flex gap-2 mb-4">
                            {mediaFiles.map((file, index) => {
                                const fileType = file.type;

                                return (
                                    <div key={index} className="w-20 h-20 overflow-hidden rounded-lg border">
                                        {fileType.startsWith("image/") ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`preview-${index}`}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : fileType.startsWith("video/") ? (
                                            <video
                                                src={URL.createObjectURL(file)}
                                                className="object-cover w-full h-full"
                                                muted
                                                loop
                                                autoPlay
                                            />
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowCreatePost(false)}
                                className="text-gray-600 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePostSubmit}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                disabled={!mediaReady}
                            >
                                Post
                            </button>
                        </div>
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setShowCreatePost(false)}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainPage;
