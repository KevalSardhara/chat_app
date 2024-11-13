exports.emitMessage = (eventName, data, status, message) => {
    return { event: eventName, data, status, message };
}