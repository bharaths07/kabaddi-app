import React, { useState } from 'react';
import { UserPlus, UserCheck, MessageCircle, MoreVertical, Search } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { useNavigate } from 'react-router-dom';

export const GameProfileFriends: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'opponents' | 'requests'>('friends');
  const [following, setFollowing] = useState<string[]>([]);

  // Mock Data
  const connections = [
    {
      id: '1',
      name: 'Sarah Connor',
      username: 'sarah_c',
      avatar: null,
      status: 'Online',
      mutuals: 12,
      game: 'Cricket'
    },
    {
      id: '2',
      name: 'John Wick',
      username: 'babayaga',
      avatar: null,
      status: 'In Game',
      mutuals: 5,
      game: 'Football'
    },
    {
      id: '3',
      name: 'Tony Stark',
      username: 'ironman',
      avatar: null,
      status: 'Offline',
      mutuals: 24,
      game: 'Badminton'
    }
  ];

  const handleFollow = (id: string) => {
    setFollowing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleMessage = (id: string) => {
    navigate(`/messages/${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button 
                onClick={() => setActiveTab('friends')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'friends' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Friends
            </button>
            <button 
                onClick={() => setActiveTab('opponents')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'opponents' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Opponents
            </button>
            <button 
                onClick={() => setActiveTab('requests')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm scale-105' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Requests
            </button>
        </div>

        <div className="relative w-full sm:w-64 group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <input 
                type="text" 
                placeholder="Search friends..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all hover:border-blue-300"
            />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
        {connections.map((user) => (
            <div 
                key={user.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/u/${user.username}`)}
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Avatar src={user.avatar} fallback={user.name[0]} className="w-12 h-12 transition-transform group-hover:scale-105" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                            user.status === 'Online' ? 'bg-green-500' : 
                            user.status === 'In Game' ? 'bg-purple-500' : 'bg-slate-300'
                        }`}></span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{user.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>@{user.username}</span>
                            <span>•</span>
                            <span>{user.mutuals} mutual friends</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e: any) => e.stopPropagation()}>
                    <button 
                        onClick={() => handleMessage(user.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors active:scale-90"
                        title="Message"
                    >
                        <MessageCircle size={20} />
                    </button>
                    {activeTab === 'friends' ? (
                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
                            <MoreVertical size={20} />
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleFollow(user.id)}
                            className={`p-2 rounded-full transition-all duration-300 active:scale-90 ${
                                following.includes(user.id) 
                                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            {following.includes(user.id) ? <UserCheck size={20} /> : <UserPlus size={20} />}
                        </button>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
