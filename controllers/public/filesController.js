const attachments = require('../../services/lessonAttachmentService');
const access = require('../../services/courseAccessService');
const { repository } = require('../../modules/files');
const { FileError } = require('../../modules/files/config');
const { send, fail } = require('../../modules/files/download');
async function download(request, response) {
  try {
    const file = await attachments.downloadRecord(request.params.id);
    if (!repository.readable(file) || !await access.hasLessonAccess(request.session.user.id, file.lesson_id)) throw new FileError('Plik nie istnieje lub nie masz do niego dostępu.', 404);
    await send(request, response, file, { userId: request.session.user.id, lessonId: file.lesson_id });
  } catch (error) { fail(response, error); }
}
module.exports = { download };
