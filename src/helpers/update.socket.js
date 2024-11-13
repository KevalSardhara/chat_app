

exports.updateConnectionArr = (socket_id, connectionArr) => {
    let updateConnectionArr = connectionArr.filter((obj) => {
        if(socket_id != obj.socket_id) {
            return obj;
        }
    });
    return updateConnectionArr;
}