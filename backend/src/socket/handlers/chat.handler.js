const handleSendMessage = async (socket, ctx, { message }, callback) => {
  const { user, services, broadcaster } = ctx;
  const userId = user.id;
  const tableId = socket.tableId;
  
  if (!tableId) {
    return callback?.({ success: false, error: '未在牌桌中' });
  }
  
  const userResult = await services.db.query(
    'SELECT username, avatar FROM users WHERE id = $1',
    [userId]
  );
  
  const userData = userResult.rows[0];
  
  broadcaster.emitToTable(tableId, 'chat_message', {
    user_id: userId,
    username: userData?.username,
    avatar: userData?.avatar,
    message,
    timestamp: new Date()
  });
  
  callback?.({ success: true });
};

module.exports = {
  handleSendMessage
};
