import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { FaUserFriends, FaHeart, FaCommentDots, FaLaughSquint, FaSadTear, FaImage, FaTimes, FaEdit } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import userLogo from "../assets/userlogo.png";
import samplePost from "../assets/post.jpg";
import defaultAvatar from "../assets/userlogo.png";
import defaultBanner from "../assets/user-banner.jpg";
import { FaPlus } from "react-icons/fa";
import axios from 'axios';
import dayjs from 'dayjs';


const UserProfilePage = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("posts");
    const [showFullImage, setShowFullImage] = useState(false);
    const [fullImageSrc, setFullImageSrc] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});
    const [editPostNewMediaFiles, setEditPostNewMediaFiles] = useState([]);
    const navigate = useNavigate();
    const [followingMap, setFollowingMap] = useState({});

    const [likes, setLikes] = useState(24); // initial like count
    const [liked, setLiked] = useState(false);

    const [userReaction, setUserReaction] = useState(null);

    const [banner, setBanner] = useState(defaultBanner);
    const [profilePic, setProfilePic] = useState(defaultAvatar);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("John Doe");
    const [bio, setBio] = useState("Passionate about teaching and tech!");

    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPostText, setNewPostText] = useState("");
    const [newPostMedia, setNewPostMedia] = useState(null);

    const [editingPost, setEditingPost] = useState(null);
    const [editPostText, setEditPostText] = useState("");
    const [editPostMedia, setEditPostMedia] = useState(null);

    const [location, setLocation] = useState("");
    const [email, setEmail] = useState("");
    const [commentText, setCommentText] = useState("");

    const [profileUserId, setProfileUserId] = useState("");
    const [caption, setCaption] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);

    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");

    // const startEditComment = (comment) => {
    //     setEditingCommentId(comment.id);
    //     setEditingCommentText(comment.content);
    // };




    const user = {
        name: "John Doe",
        bio: "Full-stack developer & tech enthusiast 👨‍💻",
        followers: 1220,
        following: 320,
        isFollowing: false,
        active: true,
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

    const emojiMap = {
        love: "❤️",
        funny: "😂",
        wow: "😮",
        sad: "😢",
        angry: "😡",
    };

    // const handleReaction = (type) => {
    //     if (userReaction === type) {
    //         // Remove existing reaction
    //         setReactions((prev) => ({
    //             ...prev,
    //             [type]: prev[type] - 1,
    //         }));
    //         setUserReaction(null);
    //     } else {
    //         // Remove previous reaction (if any), then add new one
    //         setReactions((prev) => {
    //             const updated = { ...prev };
    //             if (userReaction) {
    //                 updated[userReaction] = Math.max(updated[userReaction] - 1, 0);
    //             }
    //             updated[type] += 1;
    //             return updated;
    //         });
    //         setUserReaction(type);
    //     }
    // };


    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (activeTab === "followers") {
            fetch(`http://localhost:8080/api/follow/followers?userId=${id}`)
                .then(res => res.json())
                .then(data => setFollowers(data))
                .catch(err => console.error("Failed to load followers", err));
        } else if (activeTab === "following") {
            fetch(`http://localhost:8080/api/follow/following?userId=${id}`)
                .then(res => res.json())
                .then(data => setFollowing(data))
                .catch(err => console.error("Failed to load following", err));
        }
    }, [activeTab, id]);


    const handleEditClick = (post) => {
        setEditPostText(post.caption); // assuming 'caption' is your post text
        setEditPostMedia(post.mediaList[0]); // assuming it's an array and you use only one media
        setEditingPost(post);
    };

    const handleSaveEditedPost = async () => {
        if (!editingPost) return;

        const formData = new FormData();
        formData.append("postId", editingPost.id);
        formData.append("caption", editPostText);

        // Append each new media file
        editPostNewMediaFiles.forEach((file) => {
            formData.append("media", file);
        });

        try {
            const res = await fetch('http://localhost:8080/api/posts/update', {
                method: 'PUT',
                body: formData,
            });

            if (res.status === 200) {
                const updated = await res.json();

                // Refresh the post list
                const refreshedPosts = posts.map(post =>
                    post.id === updated.id ? updated : post
                );
                setPosts(refreshedPosts);
                setEditingPost(null);
                setEditPostNewMediaFiles([]);

            } else {
                alert("Failed to update post");
            }
        } catch (err) {
            console.error("Error updating post:", err);
            alert("An error occurred while updating the post");
        }
    };



    const openFullImage = (img) => {
        setFullImageSrc(img);
        setShowFullImage(true);
    };

    const openComments = (post) => {
        setSelectedPost(post);
        setShowComments(true);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) setBanner(URL.createObjectURL(file));
    };
    const [profilePicPreview, setProfilePicPreview] = useState(null);

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file); // store the file for form submission
            setProfilePicPreview(URL.createObjectURL(file)); // optional: for preview
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/user/profile?id=${id}`);
                const data = await res.json();
                setName(data.fullName);
                setBio(data.bio);
                setProfilePic(`http://localhost:8080/uploads/${data.photo}`);
                setLocation(data.location);
                setEmail(data.email);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        fetchUser();
    }, [id]);


    const handleSaveProfile = async () => {
        const formData = new FormData();
        formData.append('id', id); // Make sure you have userId
        formData.append('fullName', name);
        formData.append('bio', bio);

        if (profilePic instanceof File) {
            formData.append('photo', profilePic); // profilePic is File from input
        }

        try {
            const res = await fetch('http://localhost:8080/api/user/update', {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                window.location.reload();
                const updatedUser = await res.json();
                setName(updatedUser.fullName);
                setBio(updatedUser.bio);
                setProfilePic(updatedUser.photo); // ← new filename from backend
                setEditing(false);
            } else {
                console.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };


    useEffect(() => {
        axios.get(`http://localhost:8080/api/posts/user?id=${id}`)
            .then(res => setPosts(res.data))
            .catch(err => console.error(err));
    }, [id]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setProfileUserId(parsedUser.id); // Set userId directly
        }
        const fetchPostsAndComments = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/posts/user?id=${id}`);
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
                userId: id,
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


    //Reactions
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
                    userId: id,
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


    //Post Submit

    const handlePostSubmit = async () => {
        console.log("mediaFiles before upload:", mediaFiles);

        if (!caption.trim() && mediaFiles.length === 0) {
            alert("Please enter a caption or select media");
            return;
        }

        const formData = new FormData();
        formData.append("caption", newPostText);
        formData.append("userId", id);

        mediaFiles.forEach(file => {
            formData.append("mediaFiles", file);
        });

        try {
            const res = await axios.post("http://localhost:8080/api/posts/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.status === 200) {
                //alert("Post uploaded!");
                window.location.reload();
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


    //Follow
    const toggleFollow = async (id) => {
        const targetUserId = id;
        const isFollowing = followingMap[targetUserId] || false;

        const endpoint = isFollowing
            ? 'http://localhost:8080/api/follow/unfollow'
            : 'http://localhost:8080/api/follow/follow';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    followerId: profileUserId,
                    followingId: targetUserId,
                }),
            });

            if (response.ok) {
                setFollowingMap(prev => ({
                    ...prev,
                    [targetUserId]: !isFollowing,
                }));

                // Optional: update counts
                if (targetUserId === profileUserId) {
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
                            senderId: profileUserId,
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


    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            const deletepost = await axios.delete(`http://localhost:8080/api/posts/delete?postId=${postId}`, {
                withCredentials: true // add this if your backend has login/session
            });

            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            alert("Post deleted successfully!");
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Failed to delete post.");
        }
    };


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
                userId: id,
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

    // const handleDeleteComment = async (commentId) => {
    //     if (!window.confirm("Are you sure you want to delete this comment?")) {
    //         return;
    //     }

    //     try {
    //         await axios.delete(`http://localhost:8080/api/comments/delete`, {
    //             params: { commentId: commentId },
    //             withCredentials: true
    //         });

    //         fetchComments(selectedPostId); // Refresh comments
    //     } catch (error) {
    //         console.error("Failed to delete comment:", error);
    //         alert("Failed to delete comment.");
    //     }
    // };


    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Banner */}
            <div className="relative w-full h-64 bg-gray-300">
                <img
                    src={banner}
                    alt="Banner"
                    className="w-full h-full object-cover rounded-b-xl"
                />
                {/* {editing && (
                    <label className="absolute top-2 right-2 bg-white text-sm px-3 py-1 rounded-full cursor-pointer shadow">
                        Change Banner
                        <input type="file" hidden onChange={handleBannerChange} />
                    </label>
                )} */}


                {/* Profile Picture */}
                <div className="absolute -bottom-16 left-6 w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md">
                    <img
                        src={editing && profilePic instanceof File ? profilePicPreview : `${profilePic}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                    {editing && (
                        <label className="absolute bottom-0 bg-black bg-opacity-60 text-white w-full text-center text-xs py-1 cursor-pointer">
                            Edit
                            <input type="file" hidden onChange={handleProfilePicChange} />
                        </label>
                    )}
                </div>
            </div>

            {/* Floating Add Post Button */}
            {id == profileUserId && (
                <button
                    onClick={() => setShowCreatePost(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-40"
                    title="Create Post"
                >
                    <FaPlus onClick={() => setShowCreatePost(true)} />
                </button>
            )}


            {/* Create Post Modal */}
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

            {editingPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                        <h2 className="text-lg font-semibold mb-4">Edit Post</h2>
                        <textarea
                            value={editPostText}
                            onChange={(e) => setEditPostText(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border rounded-lg mb-3"
                        />
                        <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <FaImage className="text-blue-500" />
                                <span className="text-sm">Change Media</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files);
                                        setEditPostNewMediaFiles(files); // append or replace based on your logic
                                    }}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {editingPost.mediaList?.length > 0 &&
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {/* Existing Media */}
                                {editingPost.mediaList?.map((media, index) => (
                                    <div key={`existing-${index}`} className="w-20 h-20 overflow-hidden rounded-lg border">
                                        {media.mediaType === "image" ? (
                                            <img
                                                src={`http://localhost:8080${media.mediaUrl}`}
                                                alt={`Existing media ${index}`}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <video controls className="object-cover w-full h-full">
                                                <source src={`http://localhost:8080${media.mediaUrl}`} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                ))}

                                {/* New Selected Media */}
                                {editPostNewMediaFiles.map((file, index) => {
                                    const fileType = file.type;
                                    return (
                                        <div key={`new-${index}`} className="w-20 h-20 overflow-hidden rounded-lg border">
                                            {fileType.startsWith("image/") ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`New media ${index}`}
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

                        }

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditingPost(null)}
                                className="text-gray-600 hover:underline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // // Update the post
                                    // const updatedPosts = posts.map(p =>
                                    //     p.id === editingPost.id
                                    //         ? { ...p, content: editPostText, image: editPostMedia }
                                    //         : p
                                    // );
                                    handleSaveEditedPost();
                                    //setPosts(updatedPosts);
                                    setEditingPost(null);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            onClick={() => setEditingPost(null)}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}


            {/* User Info */}
            <div className="mt-20 px-6">
                {editing ? (
                    <>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-2xl font-bold border-b border-gray-300 focus:outline-none bg-transparent w-full"
                        />

                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="mt-2 text-gray-600 border-b border-gray-300 focus:outline-none bg-transparent w-full"
                        />
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold">{name}</h2>
                        <p className="text-sm text-gray-500">
                            {user.active ? "🟢 Active Now" : "🔴 Offline"}
                        </p>
                        <p className="text-gray-600 mt-1">{bio}</p>
                        <div className='flex gap-6'>
                            <div>
                                <p className="font-bold">{followersCount}</p>
                                <p className="text-sm text-gray-500">Followers</p>
                            </div>
                            <div>
                                <p className="font-bold">{followingCount}</p>
                                <p className="text-sm text-gray-500">Following</p>
                            </div>
                        </div>
                        {id != profileUserId && (
                            <button
                                onClick={() => toggleFollow(id)}
                                className={`text-sm px-2 py-1 rounded-full transition mt-4 ${followingMap[id]
                                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    }`}
                            >
                                {followingMap[id] ? "Following" : "Follow"}
                            </button>
                        )}
                    </>
                )}
                {id == profileUserId && (
                    <button
                        onClick={editing ? handleSaveProfile : () => setEditing(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                        {editing ? "Save" : "Edit Profile"}
                    </button>

                )}


            </div>



            {/* Tabs */}
            <div className="flex justify-center mt-4 gap-6 text-gray-600 font-semibold">
                <button onClick={() => setActiveTab("posts")} className={activeTab === "posts" ? "text-blue-600" : ""}>Posts</button>
                <button onClick={() => setActiveTab("about")} className={activeTab === "about" ? "text-blue-600" : ""}>About</button>
                <button onClick={() => setActiveTab("followers")} className={activeTab === "followers" ? "text-blue-600" : ""}>Followers</button>
                <button onClick={() => setActiveTab("following")} className={activeTab === "following" ? "text-blue-600" : ""}>Following</button>
            </div>

            {/* Tab Content Wrapper */}
            <div className="w-full flex justify-center">
                <div className="w-full max-w-3xl">
                    {/* Posts */}
                    {activeTab === "posts" && (
                        <div className="p-6 space-y-6">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white rounded-2xl p-4 shadow-md relative">
                                    {/* Edit Button */}
                                    {id == profileUserId && (
                                        <div>

                                            <button
                                                onClick={() => handleEditClick(post)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-blue-600"
                                                title="Edit Post"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-gray-400 hover:text-red-600"
                                                title="Delete Post"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-2">
                                        <img src={`http://localhost:8080/uploads/${post.user?.photo || userLogo}`}
                                            className="w-10 h-10 rounded-full" alt="user" />
                                        <div>
                                            <h3 className="font-semibold">{post.user?.fullName || "Unknown User"}</h3>
                                            <p className="text-xs text-gray-400">{dayjs(post.createdAt).fromNow()}</p>
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
                                                        setFullImageSrc(`http://localhost:8080${media.mediaUrl}`);
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
                    )}

                    {/* About */}
                    {activeTab === "about" && (
                        <div className="bg-white p-6 rounded-xl shadow-md text-gray-700 m-4">
                            <h3 className="text-lg font-bold mb-2">About</h3>
                            <p>👨‍💻 {bio}</p>
                            <p>📍 Location: {location}</p>
                            <p>📧 {email}</p>
                        </div>
                    )}

                    {/* Followers */}
                    {activeTab === "followers" && (
                        <div className="bg-white p-6 rounded-xl shadow-md text-gray-700 m-4">
                            <h3 className="text-lg font-bold mb-4">Followers</h3>
                            <ul className="space-y-3">
                                {followers.map(follower => (
                                    <li key={follower.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${follower.id}`)}>
                                        <img
                                            src={`http://localhost:8080/uploads/${follower.photo}`}
                                            className="w-8 h-8 rounded-full"
                                            alt="follower"
                                        />
                                        <div>
                                            <span className="font-medium">{follower.fullName}</span>
                                            <p className="text-sm text-gray-500">{follower.bio}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {activeTab === "following" && (
                        <div className="bg-white p-6 rounded-xl shadow-md text-gray-700 m-4">
                            <h3 className="text-lg font-bold mb-4">Following</h3>
                            <ul className="space-y-3">
                                {following.map(user => (
                                    <li key={user.id} className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                                        <img
                                            src={`http://localhost:8080/uploads/${user.photo}`}
                                            className="w-8 h-8 rounded-full"
                                            alt="following"
                                        />
                                        <div>
                                            <span className="font-medium">{user.fullName}</span>
                                            <p className="text-sm text-gray-500">{user.bio}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}


                </div>
            </div>


            {/* Full Image Modal */}
            {showFullImage && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
                    {/* <div className="relative"> */}
                    <img src={fullImageSrc} alt="Full" className="max-h-[90vh] rounded-xl" />
                    <button
                        className="absolute top-2 right-2 text-white text-2xl"
                        onClick={() => setShowFullImage(false)}
                    >
                        <FaTimes />
                    </button>

                    {/* </div> */}
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
                                        {id == profileUserId && (
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
                                        )}
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
        </div>
    );
};

export default UserProfilePage;
