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
  const [patternProgress, setPatternProgress] = useState({});
  // 進捗メニューの開閉状態を管理
  const [openProgressMenu, setOpenProgressMenu] = useState(null);
  const [newPost, setNewPost] = useState({
    pattern: '',
    situation: '',
    action: '',
    reflection: ''
  });

  // 学習パターンのデータ（拡張版）
  const learningPatterns = [
    // Core パターン
    {
      id: 1,
      name: "創造的な学び",
      subtitle: "Creative Learning",
      description: "既存の知識を組み合わせて新しいアイデアや解決策を生み出す学び方",
      icon: "🎨",
      category: "core",
      myProgress: "実践中"
    },
    {
      id: 2,
      name: "学びのチャンス",
      subtitle: "Learning Opportunities",
      description: "日常の中に潜む学びの機会を見逃さず、積極的に捉える",
      icon: "🎯",
      category: "core",
      myProgress: "学習中"
    },
    {
      id: 3,
      name: "つくることによる学び",
      subtitle: "Learning by Making",
      description: "実際に何かを作る過程で深い理解と気づきを得る",
      icon: "🔨",
      category: "core",
      myProgress: "実践中"
    },
    {
      id: 4,
      name: "学びをひらく",
      subtitle: "Opening Learning",
      description: "自分の学びを他者と共有し、新たな視点を得る",
      icon: "🌈",
      category: "core",
      myProgress: "未着手"
    },

    // Opportunity パターン
    {
      id: 5,
      name: "まずはつかる",
      subtitle: "Diving In First",
      description: "理論よりもまず実践に飛び込んで、体験から学ぶ",
      icon: "🏊",
      category: "opportunity",
      myProgress: "マスター"
    },
    {
      id: 6,
      name: "まねぶことから",
      subtitle: "Learning by Imitating",
      description: "優れた手本を真似することから学びを始める",
      icon: "🪞",
      category: "opportunity",
      myProgress: "実践中"
    },
    {
      id: 7,
      name: "教わり上手になる",
      subtitle: "Being a Good Student",
      description: "他者から効果的に学ぶための姿勢とスキルを身につける",
      icon: "🎓",
      category: "opportunity",
      myProgress: "学習中"
    },
    {
      id: 8,
      name: "アウトプットから始まる学び",
      subtitle: "Output-Driven Learning",
      description: "成果物を作ることを出発点として学びを深める",
      icon: "📝",
      category: "opportunity",
      myProgress: "実践中"
    },
    {
      id: 9,
      name: "学びのなかの遊び",
      subtitle: "Play in Learning",
      description: "遊び心を持って学習に取り組み、楽しみながら身につける",
      icon: "🎮",
      category: "opportunity",
      myProgress: "マスター"
    },
    {
      id: 10,
      name: "学びの竜巻",
      subtitle: "Learning Tornado",
      description: "興味のあることに集中して一気に学習を進める",
      icon: "🌪️",
      category: "opportunity",
      myProgress: "実践中"
    },
    {
      id: 11,
      name: "知のワクワク",
      subtitle: "Intellectual Excitement",
      description: "知識を学ぶ楽しさや興奮を大切にし、学習への動機を維持する",
      icon: "⚡",
      category: "opportunity",
      myProgress: "実践中"
    },
    {
      id: 12,
      name: "量は質を生む",
      subtitle: "Quantity Breeds Quality",
      description: "まずは量をこなすことで質の向上を図る",
      icon: "🔢",
      category: "opportunity",
      myProgress: "学習中"
    },

    // Creation パターン
    {
      id: 13,
      name: "動きのなかで考える",
      subtitle: "Thinking in Motion",
      description: "行動しながら考え、考えながら行動する",
      icon: "🏃",
      category: "creation",
      myProgress: "実践中"
    },
    {
      id: 14,
      name: "プロトタイピング",
      subtitle: "Prototyping",
      description: "アイデアを素早く形にして検証と改善を繰り返す",
      icon: "🛠️",
      category: "creation",
      myProgress: "実践中"
    },
    {
      id: 15,
      name: "フィールドに飛び込む",
      subtitle: "Jumping into the Field",
      description: "実際の現場に身を置いて生きた学びを得る",
      icon: "🌍",
      category: "creation",
      myProgress: "学習中"
    },
    {
      id: 16,
      name: "鳥の眼と虫の眼",
      subtitle: "Bird's Eye and Bug's Eye",
      description: "全体を俯瞰する視点と詳細を見る視点を使い分ける",
      icon: "🦅",
      category: "creation",
      myProgress: "学習中"
    },
    {
      id: 17,
      name: "隠れた関係性から学ぶ",
      subtitle: "Learning from Hidden Connections",
      description: "表面上は関係なさそうなものの間にある繋がりを見つける",
      icon: "🔍",
      category: "creation",
      myProgress: "実践中"
    },
    {
      id: 18,
      name: "探究への情熱",
      subtitle: "Passion for Inquiry",
      description: "知りたいという強い欲求を持ち続けて学び続ける",
      icon: "🔥",
      category: "creation",
      myProgress: "実践中"
    },
    {
      id: 19,
      name: "小さく生んで大きく育てる",
      subtitle: "Start Small, Grow Big",
      description: "小さなアイデアから始めて徐々に発展させる",
      icon: "🌱",
      category: "creation",
      myProgress: "実践中"
    },

    // Openness パターン
    {
      id: 20,
      name: "学びの共同体をつくる",
      subtitle: "Creating Learning Community",
      description: "共に学ぶ仲間との関係性を築き、相互に成長する",
      icon: "👥",
      category: "openness",
      myProgress: "実践中"
    },
    {
      id: 21,
      name: "問いかけの力",
      subtitle: "Power of Questions",
      description: "良い問いを投げかけることで、深い学びと気づきを生み出す",
      icon: "❓",
      category: "openness",
      myProgress: "マスター"
    },
    {
      id: 22,
      name: "はなすことでわかる",
      subtitle: "Understanding Through Talking",
      description: "他者に話すことで自分の理解を深める",
      icon: "💬",
      category: "openness",
      myProgress: "マスター"
    },
    {
      id: 23,
      name: "教えることによる学び",
      subtitle: "Learning by Teaching",
      description: "他者に教えることで自分の学びを深める",
      icon: "🏫",
      category: "openness",
      myProgress: "実践中"
    },
    {
      id: 24,
      name: "自分で考える",
      subtitle: "Thinking for Yourself",
      description: "他者の意見に流されず、自分の頭で考え抜く",
      icon: "🧠",
      category: "openness",
      myProgress: "学習中"
    }
  ];

  // サンプル投稿データ（更新版）
  const samplePosts = [
    {
      patternId: 18,
      patternName: "探究への情熱",
      situation: "新しいプログラミング言語を学ぼうと思ったとき、最初は「難しそう」という気持ちが先立ってしまいました",
      action: "まず「なぜこの言語を学びたいのか」を紙に書き出し、学習の目的を明確にしてから基本的な文法から始めました",
      reflection: "目的が明確になると、つまづいても「これは自分のビジョンのため」と思えて続けられました。情熱は意図的に育てられるものだと実感しました",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      patternId: 21,
      patternName: "問いかけの力",
      situation: "チームミーティングで新しいアイデアについて議論していましたが、みんな「でも現実的には...」という話ばかりで停滞していました",
      action: "「もし制約が一切なかったら、どんな解決策を考えますか？」と問いかけて、制約を一度忘れてもらいました",
      reflection: "制約を外すことで、全く新しい発想が生まれました。良い問いは思考の枠を広げる力があると実感しました",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      patternId: 19,
      patternName: "小さく生んで大きく育てる",
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

  // 進捗更新処理
  const updatePatternProgress = async (patternId, newProgress) => {
    try {
      setLoading(true);
      
      // Firestoreに保存（将来的な拡張）
      // await addDoc(collection(db, 'userProgress'), {
      //   patternId,
      //   progress: newProgress,
      //   userId: 'current-user-id',
      //   updatedAt: new Date()
      // });
      
      // ローカル状態を更新
      setPatternProgress(prev => ({
        ...prev,
        [patternId]: newProgress
      }));
      
    } catch (error) {
      console.error('進捗の更新に失敗しました:', error);
      alert('進捗の更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  // パターンの進捗を取得（ローカル状態 > デフォルト値）
  const getPatternProgress = (pattern) => {
    return patternProgress[pattern.id] || pattern.myProgress;
  };

  // 進捗状況の色を取得
  const getProgressColor = (progress) => {
    switch(progress) {
      case 'マスター': return 'bg-green-100 text-green-800';
      case '実践中': return 'bg-blue-100 text-blue-800';
      case '学習中': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // カテゴリーごとの色を取得
  const getCategoryColor = (category) => {
    switch(category) {
      case 'core': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'opportunity': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'creation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'openness': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // カテゴリー名を取得
  const getCategoryName = (category) => {
    switch(category) {
      case 'core': return 'Core';
      case 'opportunity': return 'Opportunity';
      case 'creation': return 'Creation';
      case 'openness': return 'Openness';
      default: return 'その他';
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

  // 進捗選択コンポーネント（開閉式）
  const ProgressSelector = ({ pattern, currentProgress, onProgressChange }) => {
    const progressOptions = [
      { value: '未着手', label: '未着手', color: 'bg-gray-100 text-gray-600' },
      { value: '学習中', label: '学習中', color: 'bg-yellow-100 text-yellow-800' },
      { value: '実践中', label: '実践中', color: 'bg-blue-100 text-blue-800' },
      { value: 'マスター', label: 'マスター', color: 'bg-green-100 text-green-800' }
    ];

    const isOpen = openProgressMenu === pattern.id;

    const handleProgressChange = (newProgress) => {
      onProgressChange(pattern.id, newProgress);
      setOpenProgressMenu(null); // メニューを閉じる
    };

    const toggleMenu = (e) => {
      e.stopPropagation();
      setOpenProgressMenu(isOpen ? null : pattern.id);
    };

    return (
      <div className="relative">
        <button 
          onClick={toggleMenu}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${getProgressColor(currentProgress)} ${
            isOpen ? 'ring-2 ring-blue-300' : 'hover:opacity-80'
          }`}
        >
          <span>{currentProgress}</span>
          <span className={`ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {isOpen && (
          <>
            {/* 背景オーバーレイ（メニュー外クリックで閉じる） */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setOpenProgressMenu(null)}
            />
            
            {/* ドロップダウンメニュー */}
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-24">
              <div className="p-2 space-y-1">
                {progressOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProgressChange(option.value);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors hover:bg-gray-50 ${
                      currentProgress === option.value 
                        ? `${option.color} font-semibold` 
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {currentProgress === option.value && <span>✓</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // 今日のパターンチャレンジを取得する関数
  const getTodaysChallenge = () => {
    // 今日の日付から一意のインデックスを生成
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const patternIndex = dayOfYear % learningPatterns.length;
    
    const todaysPattern = learningPatterns[patternIndex];
    
    // チャレンジの詳細設定
    const challengeDetails = {
      participants: Math.floor(Math.random() * 15) + 5, // 5-20人のランダム参加者数
      duration: ['今日1日', '2日間', '3日間'][Math.floor(Math.random() * 3)],
      description: getChallengeDescription(todaysPattern)
    };
    
    return {
      pattern: todaysPattern,
      ...challengeDetails
    };
  };

  // パターンごとのチャレンジ説明を生成
  const getChallengeDescription = (pattern) => {
    const challengeTexts = {
      "創造的な学び": "出会う情報を2つ以上組み合わせて新しいアイデアを考えてみよう",
      "学びのチャンス": "いつもの行動の中で「学べることはないか？」と3回問いかけてみよう",
      "つくることによる学び": "学んだことを何か小さなものに「作って」表現してみよう",
      "学びをひらく": "学びを誰かと共有してみよう",
      "まずはつかる": "理論より先に実践に飛び込む場面を作ってみよう",
      "まねぶことから": "尊敬する人の行動を1つ真似してみよう",
      "教わり上手になる": "誰かに質問して新しいことを教わってみよう",
      "アウトプットから始まる学び": "学びたいことを、まず何かを作ることから始めてみよう",
      "学びのなかの遊び": "学習に遊び心を1つ取り入れてみよう",
      "学びの竜巻": "興味のあることに集中して取り組む時間を作ってみよう",
      "知のワクワク": "学ぶことの「なぜ面白いのか」を言葉にしてみよう",
      "量は質を生む": "まずは量をこなすことを意識して取り組んでみよう",
      "動きのなかで考える": "歩きながらor動きながら考える時間を作ってみよう",
      "プロトタイピング": "アイデアを簡単な形で素早く試してみよう",
      "フィールドに飛び込む": "いつもと違う環境で学んでみよう",
      "鳥の眼と虫の眼": "全体を見る時間と詳細を見る時間を意識的に分けてみよう",
      "隠れた関係性から学ぶ": "一見関係なさそうな2つのことの繋がりを探してみよう",
      "探究への情熱": "「なぜ？」を3回以上口に出して探究してみよう",
      "小さく生んで大きく育てる": "小さなアイデアを1つ大切に育ててみよう",
      "学びの共同体をつくる": "誰かと一緒に学ぶ機会を作ってみよう",
      "問いかけの力": "良い問いを1つ誰かに投げかけてみよう",
      "はなすことでわかる": "学んだことを誰かに話して理解を深めてみよう",
      "教えることによる学び": "誰かに何かを教える機会を作ってみよう",
      "自分で考える": "他人の意見を聞く前に自分で考える時間を作ってみよう"
    };
    
    return challengeTexts[pattern.name] || `「${pattern.name}」を今日実践してみよう`;
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
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(to right, #4ade80, #facc15)'
                  }}
                >
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
          
          {/* 今日のチャレンジ */}
          {(() => {
            const todaysChallenge = getTodaysChallenge();
            return (
              <div 
                className="rounded-2xl p-6 text-white mb-8"
                style={{
                  background: 'linear-gradient(to right, #4ade80, #facc15)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">今日のパターンチャレンジ</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)' }} className="mb-2">
                      {todaysChallenge.description}
                    </p>
                    <div className="flex items-center mt-3 space-x-4 text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      <span className="flex items-center space-x-1">
                        <span>👥</span>
                        <span>参加者 {todaysChallenge.participants}人</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{todaysChallenge.duration}チャレンジ</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>🎯</span>
                        <span>{todaysChallenge.pattern.name}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-6xl">{todaysChallenge.pattern.icon}</div>
                </div>
              </div>
            );
          })()}

          {/* パターン一覧 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🛠️ 学習パターン</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  全{learningPatterns.length}パターン
                </span>
                <button 
                  onClick={() => setCurrentView('community')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  💬 みんなの体験を見る
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p className="mt-2 text-gray-600">読み込み中...</p>
              </div>
            )}

            {/* カテゴリー別表示 */}
            {['core', 'opportunity', 'creation', 'openness'].map((category, index) => {
              const categoryPatterns = learningPatterns.filter(p => p.category === category);
              return (
                <div key={category} className={`${index > 0 ? 'mt-16' : ''} mb-8`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className={`text-lg font-bold px-3 py-1 rounded-full border ${getCategoryColor(category)}`}>
                      {getCategoryName(category)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {categoryPatterns.length}パターン
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryPatterns.map(pattern => {
                      const currentProgress = getPatternProgress(pattern);
                      return (
                        <div 
                          key={pattern.id}
                          className="pattern-card bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                          onClick={() => {
                            setSelectedPattern(pattern);
                            setCurrentView('pattern-detail');
                          }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl">{pattern.icon}</span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <ProgressSelector 
                                pattern={pattern}
                                currentProgress={currentProgress}
                                onProgressChange={updatePatternProgress}
                              />
                            </div>
                          </div>
                          <h4 className="font-bold text-md text-gray-900 mb-3">{pattern.name}</h4>
                          <p className="text-gray-600 text-sm mb-4 overflow-hidden leading-relaxed" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{pattern.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
                            <span className="flex items-center space-x-1">
                              <span>📝</span>
                              <span>{getPatternPostCount(pattern.id)}件</span>
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(pattern.category)}`}>
                              {getCategoryName(pattern.category)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
    const currentProgress = getPatternProgress(selectedPattern);

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
                <ProgressSelector 
                  pattern={selectedPattern}
                  currentProgress={currentProgress}
                  onProgressChange={updatePatternProgress}
                />
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
                    placeholder="具体的な状況を教えてください"
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
                    placeholder="このパターンを使ってどう行動したか教えてください"
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
                    placeholder="気づきや学びを教えてください"
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
