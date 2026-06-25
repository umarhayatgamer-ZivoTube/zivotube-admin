"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import {
    Video, Image as ImageIcon, Upload, Save, Trash2,
    Plus, Play, CheckCircle, AlertCircle, RefreshCw,
    Film, LayoutGrid, Users, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Trending", "Motivation", "Islamic", "Funny", "Tech", "Education", "Lifestyle", "Gaming", "Poetry", "Business"];

export default function DemoContentPage() {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [creators, setCreators] = useState<any[]>([]);

    // Form State
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Trending",
        creatorId: "",
        creatorUsername: "",
        views: 1000,
        likes: 500,
        comments: 50,
        isFeatured: false
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbFile, setThumbFile] = useState<File | null>(null);
    const [demoVideos, setDemoVideos] = useState<any[]>([]);

    useEffect(() => {
        fetchCreators();
        fetchDemoVideos();
    }, []);

    const fetchCreators = async () => {
        const snap = await getDocs(query(collection(db, "users"), where("isCreator", "==", true)));
        setCreators(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const fetchDemoVideos = async () => {
        const snap = await getDocs(query(collection(db, "videos"), where("isDemo", "==", true)));
        setDemoVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const handleUpload = async () => {
        if (!videoFile || !thumbFile || !form.creatorId) {
            alert("Please select Video, Thumbnail and Creator.");
            return;
        }

        setUploading(true);
        try {
            const videoExt = videoFile.name.split('.').pop();
            const thumbExt = thumbFile.name.split('.').pop();
            const videoName = `${Date.now()}_demo.${videoExt}`;
            const thumbName = `${Date.now()}_demo.${thumbExt}`;

            // 1. Upload to Supabase
            const { data: vData, error: vErr } = await supabase.storage.from('videos').upload(videoName, videoFile);
            const { data: tData, error: tErr } = await supabase.storage.from('thumbnails').upload(thumbName, thumbFile);

            if (vErr || tErr) throw vErr || tErr;

            const videoUrl = supabase.storage.from('videos').getPublicUrl(videoName).data.publicUrl;
            const thumbUrl = supabase.storage.from('thumbnails').getPublicUrl(thumbName).data.publicUrl;

            // 2. Save to Firestore
            const creator = creators.find(c => c.id === form.creatorId);
            await addDoc(collection(db, "videos"), {
                caption: form.title,
                description: form.description,
                category: form.category,
                videoUrl,
                thumbnailUrl: thumbUrl,
                creatorId: form.creatorId,
                creatorUsername: creator?.username || "Unknown",
                viewsCount: form.views,
                likesCount: form.likes,
                commentsCount: form.comments,
                isApproved: true,
                isPublic: true,
                status: "approved",
                isFeatured: form.isFeatured,
                isDemo: true,
                createdAt: serverTimestamp()
            });

            alert("Demo video synchronized successfully.");
            setForm({ ...form, title: "", description: "" });
            setVideoFile(null);
            setThumbFile(null);
            fetchDemoVideos();
        } catch (e: any) {
            console.error(e);
            alert("Upload failed: " + e.message);
        }
        setUploading(false);
    };

    const deleteDemoVideo = async (id: string) => {
        if (!confirm("Permanent deletion of this node?")) return;
        await deleteDoc(doc(db, "videos", id));
        fetchDemoVideos();
    };

    const seedDemoContent = async () => {
        if (!confirm("This will synchronize 50+ demo videos across the network. Proceed?")) return;
        setLoading(true);
        try {
            const videoCategories = ["Trending", "Motivation", "Islamic", "Funny", "Tech", "Education", "Lifestyle", "Gaming", "Poetry", "Business"];
            const thumbUrls = [
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800",
                "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800",
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800",
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"
            ];

            for (let i = 1; i <= 50; i++) {
                const cat = videoCategories[i % videoCategories.length];
                const creatorIdx = i % creators.length;
                const creator = creators.length > 0 ? creators[creatorIdx] : { id: "system", username: "ZivoAdmin" };

                await addDoc(collection(db, "videos"), {
                    caption: `[${cat}] Alpha Protocol Synchronization #${i}.`,
                    category: cat,
                    creatorId: creator.id,
                    creatorUsername: creator.username,
                    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                    thumbnailUrl: thumbUrls[i % thumbUrls.length],
                    viewsCount: Math.floor(Math.random() * 10000),
                    likesCount: Math.floor(Math.random() * 2000),
                    commentsCount: Math.floor(Math.random() * 100),
                    isApproved: true,
                    isPublic: true,
                    isFeatured: i % 10 === 0,
                    isDemo: true,
                    status: "approved",
                    createdAt: serverTimestamp()
                });
            }
            alert("50+ Demo nodes synchronized.");
            fetchDemoVideos();
        } catch(e) { console.error(e); }
        setLoading(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Demo <span className="text-[#FF2D2D]">Content</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Provisioning Baseline Assets for Network Launch</p>
                </div>
                <button
                    onClick={seedDemoContent}
                    disabled={loading}
                    className="flex items-center gap-3 bg-[#1A1A1A] border border-[#242424] hover:border-[#FF2D2D]/50 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl"
                >
                    {loading ? <RefreshCw className="animate-spin" size={16}/> : <Zap className="text-[#FF2D2D]" size={16} />}
                    Seed 50+ Demo Videos
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="admin-card border-[#FF2D2D]/20">
                        <h3 className="text-lg font-black text-white flex items-center gap-3 mb-8">
                            <div className="p-2 bg-red-500/10 rounded-lg text-[#FF2D2D]"><Plus size={20}/></div>
                            Ingest Demo Node
                        </h3>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <FileUpload label="Video Asset" icon={Film} accept="video/*" onChange={setVideoFile} file={videoFile} />
                                <FileUpload label="Thumbnail" icon={ImageIcon} accept="image/*" onChange={setThumbFile} file={thumbFile} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Title</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                    className="w-full bg-[#090909] border border-[#242424] text-white p-4 rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none"
                                    placeholder="Enter video title..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Sector (Category)</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({...form, category: e.target.value})}
                                        className="w-full bg-[#090909] border border-[#242424] text-white p-4 rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none"
                                    >
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Creator</label>
                                    <select
                                        value={form.creatorId}
                                        onChange={e => setForm({...form, creatorId: e.target.value})}
                                        className="w-full bg-[#090909] border border-[#242424] text-white p-4 rounded-2xl text-sm font-bold focus:border-[#FF2D2D] outline-none"
                                    >
                                        <option value="">Select Creator...</option>
                                        {creators.map(c => <option key={c.id} value={c.id}>{c.username}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <MetricInput label="Views" value={form.views} onChange={v => setForm({...form, views: v})} />
                                <MetricInput label="Likes" value={form.likes} onChange={v => setForm({...form, likes: v})} />
                                <MetricInput label="Comments" value={form.comments} onChange={v => setForm({...form, comments: v})} />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-[#090909] border border-[#242424] rounded-2xl cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={form.isFeatured}
                                    onChange={e => setForm({...form, isFeatured: e.target.checked})}
                                    className="w-4 h-4 rounded border-[#242424] bg-transparent text-[#FF2D2D] focus:ring-0"
                                />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Mark as Featured / Trending</span>
                            </label>

                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full premium-button py-4 mt-4 flex items-center justify-center gap-3"
                            >
                                {uploading ? <RefreshCw className="animate-spin" size={18}/> : <Upload size={18}/>}
                                {uploading ? "Broadcasting..." : "Synchronize Demo Node"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Registry */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="admin-card">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><LayoutGrid size={20}/></div>
                                Active Demo Registry
                            </h3>
                            <span className="bg-[#1A1A1A] text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#242424]">
                                {demoVideos.length} Nodes
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {demoVideos.map((video) => (
                                <div key={video.id} className="p-4 bg-[#090909] border border-[#242424] rounded-3xl flex gap-4 group hover:border-[#FF2D2D]/30 transition-all">
                                    <div className="w-24 h-32 rounded-2xl overflow-hidden bg-[#121212] relative shrink-0">
                                        <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <div className="p-2 bg-[#FF2D2D] rounded-full text-white shadow-xl shadow-red-900/50">
                                                <Play size={16} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded border border-blue-500/20">
                                                    {video.category}
                                                </span>
                                                {video.isFeatured && (
                                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase tracking-widest rounded border border-amber-500/20">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-white font-black text-sm tracking-tight line-clamp-1 uppercase">{video.caption}</p>
                                            <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-tighter">By @{video.creatorUsername}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-600 uppercase">Yield</span>
                                                    <span className="text-xs font-black text-white">{video.viewsCount?.toLocaleString()}</span>
                                                </div>
                                                <div className="w-px h-6 bg-[#242424]" />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-600 uppercase">Pulse</span>
                                                    <span className="text-xs font-black text-white">{video.likesCount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteDemoVideo(video.id)}
                                                className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {demoVideos.length === 0 && (
                                <div className="col-span-full py-32 border-2 border-dashed border-[#242424] rounded-[40px] text-center">
                                    <AlertCircle className="mx-auto text-slate-800 mb-4" size={48} />
                                    <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-[10px]">Registry Empty: No baseline nodes initialized</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, subtitle }: { title: string, subtitle: string }) {
    return (
        <div className="mb-8 p-6 bg-gradient-to-r from-red-500/5 to-transparent border-l-4 border-[#FF2D2D] rounded-r-2xl">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>
        </div>
    );
}

function FileUpload({ label, icon: Icon, accept, onChange, file }: { label: string, icon: any, accept: string, onChange: (f: File) => void, file: File | null }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
            <label className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 bg-[#090909] border-2 border-dashed rounded-3xl cursor-pointer transition-all hover:bg-black",
                file ? "border-emerald-500/30 bg-emerald-500/5" : "border-[#242424] hover:border-[#FF2D2D]/30"
            )}>
                <div className={cn("p-3 rounded-2xl bg-[#121212] border border-[#242424]", file && "text-emerald-500")}>
                    {file ? <CheckCircle size={20}/> : <Icon size={20}/>}
                </div>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest text-center">
                    {file ? file.name.substring(0, 15) + "..." : "Select File"}
                </span>
                <input type="file" accept={accept} onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} className="hidden" />
            </label>
        </div>
    );
}

function MetricInput({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[7px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
            <input
                type="number"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full bg-[#090909] border border-[#242424] text-white p-3 rounded-xl text-xs font-black focus:border-[#FF2D2D] outline-none"
            />
        </div>
    );
}
