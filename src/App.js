import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState({
    pattern: '',
    situation: '',
    action: '',
    reflection: ''
  });

  // 学習パターンのデータ
  const learningPatterns = [
    {
      id: 1,
      name: "学習への情熱",
      subtitle: "Learning Passion",
      description: "学ぶことへの純粋な興味と情熱を大切にし、それを維持し続ける",
      icon: "🔥",
      category: "motivation",
      myProgress: "実践中"
    },
    {
      id: 2,
      name: "問いかけの力",
      subtitle: "Power of Questions",
      description: "良い問いを投げかけることで、深い学びと気づきを生み出す",
      icon: "❓",
      category: "dialogue",
      myProgress: "マスター"
    },
    {
      id: 3,
      name: "アイデアを育てる",
      subtitle: "Nurturing Ideas",
      description: "小さなアイデアの種を大切に育て、創造的な成果につなげる",
      icon: "🌱",
      category: "creativity",
      myProgress: "学習中"
    },
    {
      id: 4,
      name: "振り返りの習慣",
      subtitle: "Reflection Practice",
      description: "経験を意味のある学びに変える振り返りを習慣化する",
      icon: "🪞",
      category: "reflection",
      myProgress: "未着手"
    },
    {
      id: 5,
      name: "知識を結びつける",
      subtitle: "Connecting Knowledge",
      description: "異なる分野の知識を結びつけて新しい洞察を得る",
      icon: "🔗",
      category: "synthesis",
      myProgress: "実践中"
    }
  ];

  // サンプル投稿データ（初期データ用）
  const samplePosts = [
    {
      patternId: 1,
      patternName: "学習への情熱",
      situation: "新しいプログラミング言語を学ぼうと思ったとき、最初は「難しそう」という気持ちが先立ってしまいました",
      action: "まず「なぜこの言語を学びたいのか」を紙に書き出し、学習の目的を明確にしてから基本的な文法から始めました",
      reflection: "目的が明確になると、つまづいても「これは自分のビジョンのため」と思えて続けられました。情熱は意図的に育てられるものだと実感しました",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      patternId: 2,
      patternName: "問いかけの力",
      situation: "チームミーティングで新しいアイデアについて議論していましたが、みんな「でも現実的には...」という話ばかりで停滞していました",
      action: "「もし制約が一切なかったら、どんな解決策を考えますか？」と問いかけて、制約を一度忘れてもらいました",
      reflection: "制約を外すことで、全く新しい発想が生まれました。良い問いは思考の枠を広げる力があると実感しました",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      patternId: 3,
      patternName: "アイデアを育てる",
      situation: "会議で出た小さなアイデアに対して「それは難しいのでは」という反応が多く、そのまま流されそうになりました",
      action: "「このアイデアを実現するには何が必要でしょうか？」と問いかけ、実現の方法をチーム全体で考え続けました",
      reflection: "小さなアイデアも丁寧に育てることで、実現可能な形に発展することがわかりました。アイデアは最初から完璧である必要はないと学びました",
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  // Firestoreからデータを取得
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'posts'), 
        orderBy('timestamp', 'desc'), 
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const postsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          ...data,
          date: formatDate(data.timestamp?.toDate() || new Date())
        });
      });

      setPosts(postsData);
    } catch (error) {
      console.error('投稿の取得に失敗しました:', error);
      // エラー時はサンプルデータを使用
      const formattedSamplePosts = samplePosts.map((post, index) => ({
        id: index + 1,
        ...post,
        date: formatDate(post.timestamp)
      }));
      setPosts(formattedSamplePosts);
    } finally {
      setLoading(false);
    }
  };

  // 日付フォーマット
  const formatDate = (date) => {
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '1日前';
    if (diffDays < 7) return `${diffDays}日前`;
    return `${Math.floor(diffDays / 7)}週間前`;
  };

  // 初期化
  useEffect(() => {
    fetchPosts();
  }, []);

  // 進捗状況の色を取得
  const getProgressColor = (progress) => {
    switch(progress) {
      case 'マスター': return 'bg-green-100 text-green-800';
      case '実践中': return 'bg-blue-100 text-blue-800';
      case '学習中': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // パターンごとの投稿数を計算
  const getPatternPostCount = (patternId) => {
    return posts.filter(post => post.patternId === patternId).length;
  };

  // 投稿処理
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    
    if (newPost.pattern && newPost.situation && newPost.action && newPost.reflection) {
      const selectedPatternData = learningPatterns.find(p => p.name === newPost.pattern);
      
      const post = {
        patternId: selectedPatternData?.id || 1,
        patternName: newPost.pattern,
        situation: newPost.situation,
        action: newPost.action,
        reflection: newPost.reflection,
        timestamp: new Date()
      };

      try {
        setLoading(true);
        await addDoc(collection(db, 'posts'), post);
        
        // 投稿後にデータを再取得
        await fetchPosts();
        
        setNewPost({ pattern: '', situation: '', action: '', reflection: '' });
        setShowPostForm(false);
      } catch (error) {
        console.error('投稿の保存に失敗しました:', error);
        alert('投稿の保存に失敗しました。もう一度お試しください。');
      } finally {
        setLoading(false);
      }
    }
  };

  // ホーム画面
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🌱</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pattern Garden</h1>
                  <p className="text-sm text-gray-600">学習パターンで共に成長する</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                最終更新: {new Date().toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          
          {/* 今週のチャレンジ */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">今週のパターンチャレンジ</h2>
                <p className="text-purple-100">「問いかけの力」を実践してみよう</p>
                <div className="flex items-center mt-3 space-x-4 text-sm text-purple-100">
                  <span className="flex items-center space-x-1">
                    <span>👥</span>
                    <span>参加者 6人</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>📅</span>
                    <span>2週間テスト中</span>
                  </span>
                </div>
              </div>
              <div className="text-6xl">❓</div>
            </div>
          </div>

          {/* パターン一覧 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🛠️ 学習パターン</h2>
              <button 
                onClick={() => setCurrentView('community')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-4"
              >
                💬 みんなの体験を見る
              </button>
            </div>
            
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPatterns.map(pattern => (
                <div 
                  key={pattern.id}
                  className="pattern-card bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1"
                  onClick={() => {
                    setSelectedPattern(pattern);
                    setCurrentView('pattern-detail');
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{pattern.icon}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(pattern.myProgress)}`}>
                      {pattern.myProgress}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{pattern.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pattern.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <span>📝</span>
                      <span>{getPatternPostCount(pattern.id)}件の体験</span>
                    </span>
                    <span>📈</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近の体験共有 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">💬 最近の体験共有</h2>
            <div className="space-y-4">
              {posts.slice(0, 3).map(post => (
                <div key={post.id} className="post-card bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-3">{post.date} • {post.patternName}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">🗺️ 状況: </span>
                      <span className="text-gray-600">{post.situation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🚲 行動: </span>
                      <span className="text-gray-600">{post.action}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">💡 振り返り: </span>
                      <span className="text-gray-600">{post.reflection}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // パターン詳細画面
  if (currentView === 'pattern-detail' && selectedPattern) {
    const patternPosts = posts.filter(post => post.patternId === selectedPattern.id);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                ←
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedPattern.icon}</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{selectedPattern.name}</h1>
                  <p className="text-gray-600">{selectedPattern.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border mb-8">
            <p className="text-lg text-gray-700 mb-6">{selectedPattern.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>📝</span>
                  <span>{patternPosts.length}件の体験</span>
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(selectedPattern.myProgress)}`}>
                  {selectedPattern.myProgress}
                </span>
              </div>
              <button 
                onClick={() => {
                  setNewPost({...newPost, pattern: selectedPattern.name});
                  setShowPostForm(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={loading}
              >
                <span>➕</span>
                <span>💬 体験を共有</span>
              </button>
            </div>
          </div>

          {/* 投稿フォーム */}
          {showPostForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
              <h3 className="font-bold text-lg text-gray-900 mb-4">💬 あなたの体験を共有してください</h3>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🗺️ どんな状況でしたか？</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="🗺️ 具体的な状況を教えてください"
                    value={newPost.situation}
                    onChange={(e) => setNewPost({...newPost, situation: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🚲 どんな行動を取りましたか？</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="🚲 このパターンを使ってどう行動したか教えてください"
                    value={newPost.action}
                    onChange={(e) => setNewPost({...newPost, action: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💡 振り返ってどうでしたか？</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="2"
                    placeholder="💡 気づきや学びを教えてください"
                    value={newPost.reflection}
                    onChange={(e) => setNewPost({...newPost, reflection: e.target.value})}
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    disabled={loading}
                  >
                    {loading ? '投稿中...' : '共有する'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* このパターンの体験一覧 */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">💬 みんなの体験</h3>
            <div className="space-y-4">
              {patternPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">{post.date}</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">🗺️ 状況: </span>
                      <span className="text-gray-600">{post.situation}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🚲 行動: </span>
                      <span className="text-gray-600">{post.action}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">💡 振り返り: </span>
                      <span className="text-gray-600">{post.reflection}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // コミュニティ画面
  if (currentView === 'community') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentView('home')}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">コミュニティ</h1>
                <p className="text-gray-600">💬 みんなの学習体験を見てみよう</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="mt-2 text-gray-600">読み込み中...</p>
            </div>
          )}
          
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{post.date} • {post.patternName}</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">🗺️ 状況: </span>
                    <span className="text-gray-600">{post.situation}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">🚲 行動: </span>
                    <span className="text-gray-600">{post.action}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">💡 振り返り: </span>
                    <span className="text-gray-600">{post.reflection}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }
};

export default App;
