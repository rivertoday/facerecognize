# encoding:utf-8
import os
import base64
import requests
import json
from django.http import HttpResponse
from baiduface.settings import BASE_DIR

MY_ERROR_NOFILE = 'No profile uploaded'
MY_ERROR_WRONGREQ = 'Wrong request method'
MY_ERROR_TOKENFAIL = 'Request baidu ai token failed'
MY_ERROR_SEARCHFAIL = 'Search baidu ai image failed'


def get_user_profiles(request):
    print(request.method)
    if request.method == 'POST':
        if request.FILES:
            myFile = None
            for i in request.FILES:
                myFile = request.FILES[i]
            if myFile:
                dir = os.path.join(os.path.join(BASE_DIR, 'upload'), 'profiles')
                destination = open(os.path.join(dir, myFile.name), 'wb+')
                for chunk in myFile.chunks():
                    destination.write(chunk)
                destination.close()
            return HttpResponse('ok')


def verify(request):
    # First, get the uploaded image profile
    dir = os.path.join(os.path.join(BASE_DIR, 'upload'), 'profiles')
    myFile = None
    if request.method == 'POST':
        if request.FILES:
            for i in request.FILES:
                myFile = request.FILES[i]
            if myFile:
                destination = open(os.path.join(dir, myFile.name), 'wb+')
                for chunk in myFile.chunks():
                    destination.write(chunk)
                destination.close()
        else:
            return HttpResponse(MY_ERROR_NOFILE)
    else:
        return HttpResponse(MY_ERROR_WRONGREQ)

    ################################
    # Second, get the authenication token
    # client_id 为官网获取的AK， client_secret 为官网获取的SK
    app_id = your_id
    client_id = "your ak"
    client_secret = "your sk"
    access_token = ''
    host = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + client_id + '&client_secret=' + client_secret
    print(">>>REQ HOST: %s" % host)
    response = requests.get(host)
    if response:
        print("TOKEN request: %s" % (response.json()))
        access_token = response.json()["access_token"]
    else:
        return HttpResponse(MY_ERROR_TOKENFAIL)

    ################################
    # Third, base64 encode the uploaded image
    image = os.path.join(dir, myFile.name)
    f = open(image, 'rb')
    img_raw_data = f.read()
    f.close()
    img_b64_data = base64.b64encode(img_raw_data)
    img_b64_str = str(img_b64_data, 'utf-8')
    print(">>>IMG_BASE64: %s" % img_b64_str)

    ################################
    # The last step, search the baidu image base to match the profile
    request_url = "https://aip.baidubce.com/rest/2.0/face/v3/search"
    params = "{\"image\":\"" + img_b64_str + "\",\"image_type\":\"BASE64\",\"group_id_list\":\"facerecogtest,test\",\"quality_control\":\"LOW\",\"liveness_control\":\"NORMAL\"}"
    # access_token = '24.41c4aceef8f777bc85aff7a17f4bd209.2592000.1576224048.282335-17760920'
    request_url = request_url + "?access_token=" + access_token
    headers = {'content-type': 'application/json'}
    resp = requests.post(request_url, data=params, headers=headers)
    if resp:
        result = resp.json()
        print(result)
        rdata = {}
        if result['error_code'] == 0:
            user = result['result']['user_list'][0];
            no = user['user_id'];
            score = user['score'];
            if score >= 90:
                rdata['conclusion'] = "MATCH"
                rdata['score'] = score
                rdata['userid'] = no
                print(">>>rdata:%s"%rdata)
                return HttpResponse(json.dumps(rdata))
            else:
                rdata['conclusion'] = "NOT LIKE"
                rdata['score'] = score
                print(">>>rdata:%s" % rdata)
                return HttpResponse(json.dumps(rdata))
        else:
            rdata['conclusion'] = "FAILED"
            print(">>>rdata:%s" % rdata)
            return HttpResponse(json.dumps(rdata))
    else:
        return HttpResponse(MY_ERROR_SEARCHFAIL)
