const youtubeIdPattern = /^[a-zA-Z0-9_-]{6,32}$/;

function show(request, response) {
  const videoId = String(request.params.videoId || '').trim();
  if (!youtubeIdPattern.test(videoId)) {
    response.status(404).send('Not found');
    return;
  }

  response.render('public/youtube', {
    title: 'Polskie Budownictwo - video',
    videoId,
  });
}

module.exports = {
  show,
};
