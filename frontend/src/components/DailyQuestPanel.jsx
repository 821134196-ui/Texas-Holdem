import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTodayBoard, claimCheckin, claimQuest, clearToast } from '../store/questSlice';
import { updateChips } from '../store/authSlice';

const DailyQuestPanel = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { todayBoard, loading, toast } = useSelector(state => state.quest);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchTodayBoard());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (toast) {
      if (toast.type === 'success') {
        dispatch(fetchTodayBoard());
      }
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);

  const handleCheckin = () => {
    if (loading || todayBoard?.checkin?.is_checked_in) return;
    dispatch(claimCheckin()).then((result) => {
      if (result.payload?.chips !== undefined) {
        dispatch(updateChips(result.payload.chips));
      }
    });
  };

  const handleClaimQuest = (code) => {
    if (loading) return;
    dispatch(claimQuest(code)).then((result) => {
      if (result.payload?.chips !== undefined) {
        dispatch(updateChips(result.payload.chips));
      }
    });
  };

  if (!isOpen) return null;

  const progressPercent = (progress, target) => {
    return Math.min((progress / target) * 100, 100);
  };

  const progressText = (progress, target) => {
    return `${Math.min(progress, target)}/${target}`;
  };

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#28a745' : '#dc3545',
          color: '#fff',
          fontSize: '1rem',
          zIndex: 2001,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: isOpen ? 'block' : 'none'
        }}
        onClick={onClose}
      />

      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        maxWidth: '100%',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#ffd700' }}>
            每日任务
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.1)'; }}
          >
            ✕
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ffd700' }}>
                每日签到
              </h3>
              <span style={{
                fontSize: '0.85rem',
                color: '#aaa'
              }}>
                连续 {todayBoard?.checkin?.streak || 0} 天
              </span>
            </div>

            {todayBoard?.checkin?.is_checked_in ? (
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'rgba(40, 167, 69, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(40, 167, 69, 0.3)'
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✓</span>
                <span style={{ color: '#28a745', fontSize: '1rem' }}>
                  今日已签到，获得 {todayBoard.checkin.reward} 筹码
                </span>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    今日签到可获得
                  </span>
                  <span style={{
                    color: '#ffd700',
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    {todayBoard?.checkin?.next_reward || 100} 筹码
                  </span>
                </div>
                <button
                  onClick={handleCheckin}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: loading ? '#666' : 'linear-gradient(90deg, #ffd700 0%, #ffb700 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {loading ? '签到中...' : '立即签到'}
                </button>
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const isActive = day <= (todayBoard?.checkin?.streak || 0);
                  const isToday = day === (todayBoard?.checkin?.streak || 0) + 1 && !todayBoard?.checkin?.is_checked_in;
                  return (
                    <div
                      key={day}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isActive 
                          ? 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)'
                          : isToday 
                            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 183, 0, 0.3) 100%)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border: isToday ? '1px dashed rgba(255, 215, 0, 0.5)' : 'none',
                        fontSize: '0.7rem',
                        color: isActive ? '#fff' : '#666'
                      }}
                    >
                      <span style={{ fontSize: '0.6rem', marginBottom: '2px' }}>
                        {day === 1 ? '第1天' : day === 7 ? '第7天' : ''}
                      </span>
                      <span style={{ fontSize: '1rem' }}>
                        {isActive ? '✓' : day === 7 ? '500' : (100 + (day - 1) * 50)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            color: '#fff'
          }}>
            今日任务
          </h3>

          {loading && !todayBoard && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              加载中...
            </div>
          )}

          {todayBoard?.quests?.map((quest) => (
            <div
              key={quest.code}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1rem',
                border: quest.can_claim 
                  ? '1px solid rgba(40, 167, 69, 0.5)' 
                  : quest.claimed 
                    ? '1px solid rgba(100, 100, 100, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>
                      {quest.name}
                    </h4>
                    {quest.claimed && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#28a745',
                        background: 'rgba(40, 167, 69, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        已领取
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: '0.25rem 0 0 0',
                    fontSize: '0.85rem',
                    color: '#aaa'
                  }}>
                    {quest.description}
                  </p>
                </div>
                <span style={{
                  color: '#ffd700',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>
                  +{quest.reward}
                </span>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: '#aaa',
                  marginBottom: '0.5rem'
                }}>
                  <span>进度</span>
                  <span style={{ color: quest.progress >= quest.target ? '#28a745' : '#aaa' }}>
                    {progressText(quest.progress, quest.target)}
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPercent(quest.progress, quest.target)}%`,
                    background: quest.progress >= quest.target 
                      ? 'linear-gradient(90deg, #28a745 0%, #34ce57 100%)'
                      : 'linear-gradient(90deg, #007bff 0%, #0099ff 100%)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {quest.can_claim ? (
                <button
                  onClick={() => handleClaimQuest(quest.code)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    background: loading 
                      ? '#666' 
                      : 'linear-gradient(90deg, #28a745 0%, #218838 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.target.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  {loading ? '领取中...' : '领取奖励'}
                </button>
              ) : quest.claimed ? (
                <div style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  color: '#666',
                  fontSize: '0.85rem'
                }}>
                  奖励已领取
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '0.5rem',
                  color: '#666',
                  fontSize: '0.85rem'
                }}>
                  完成任务后可领取
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default DailyQuestPanel;
