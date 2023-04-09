from rest_framework.response import Response
from django.http import HttpResponseBadRequest
from rest_framework.decorators import api_view
from .noddingpigeon.inference import predict_video
from django.views.decorators.csrf import csrf_exempt, csrf_protect



@api_view(['POST'])
def detectHeadGesture(request):
    if request.method != 'POST':
        return HttpResponseBadRequest('Invalid request method')

    video_obj = request.FILES.get('video_frame')
    if not video_obj:
        return HttpResponseBadRequest('Missing video frame')

    # Get the temporary file path of the InMemoryUploadedFile object
    file_path = ""
    try:
        file_path = video_obj.temporary_file_path()
    except AttributeError:
        # If temporary_file_path() is not available, write the file to a temporary file
        import tempfile
        import shutil
        with tempfile.NamedTemporaryFile(delete=False) as tmpfile:
            shutil.copyfileobj(video_obj.file, tmpfile)
            file_path = tmpfile.name

    result = predict_video(file_path)
    print(result)
    return Response(result)
