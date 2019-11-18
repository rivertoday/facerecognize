# encoding:utf-8
import os
import base64
import requests
import json
import cv2
import numpy as np
from django.http import HttpResponse
from baiduface.settings import BASE_DIR
from .myutils import diagnoselib

MY_ERROR_NOFILE = 'No profile uploaded'
MY_ERROR_WRONGREQ = 'Wrong request method'
MY_ERROR_TOKENFAIL = 'Request baidu ai token failed'
MY_ERROR_SEARCHFAIL = 'Search baidu ai image failed'
MY_DEBUG_BREAK = 'This is a debug break'

def cropTongue(srcfile):
    dir = os.path.join(BASE_DIR, 'cascades')
    tongueCascade = cv2.CascadeClassifier(os.path.join(dir, 'cascade.xml'))
    img = cv2.imread(srcfile)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    tongues = tongueCascade.detectMultiScale(
        gray,
        scaleFactor=1.38,  # 该参数需要根据自己训练的模型进行调参
        minNeighbors=4,  # minNeighbors控制着误检测，默认值为3表明至少有3次重叠检测，我们才认为人脸确实存
        minSize=(20, 20),  # 寻找舌头的最小区域。设置这个参数过大，会以丢失小物体为代价减少计算量。
        flags=cv2.IMREAD_GRAYSCALE
    )

    if len(tongues) > 0:
        for tongueRect in tongues:
            x, y, w, h = tongueRect
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 69, 255), 2)
            cropImg = img[y:(y + h), x:(x + w)]  # 获取感兴趣区域
            cv2.imwrite(srcfile + "_crop.bmp", cropImg)  # 保存到指定目录
            return srcfile + "_crop.bmp"
    else:
        return srcfile



def diagnose(request):
    # First, get the uploaded image profile
    dir = os.path.join(os.path.join(BASE_DIR, 'upload'), 'tongues')
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
    app_id = 17769587
    client_id = "3HoWzpoeONGFQasM7gfkPGv3"
    client_secret = "aQCS81oGIZSiYOoz7RRZCgIWl85EzA1i"
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
    # Third, detect the tongue part of the image, and crop it
    # then make base64 encode the uploaded image
    srcimg = os.path.join(dir, myFile.name)
    dstimg = cropTongue(srcimg)

    f = open(dstimg, 'rb')
    img_raw_data = f.read()
    f.close()
    img_b64_data = base64.b64encode(img_raw_data)
    img_b64_str = str(img_b64_data, 'utf-8')
    print(">>>IMG_BASE64: %s" % img_b64_str)

    ################################
    # The last step, search the baidu image base to match the profile
    request_url = "https://aip.baidubce.com/rest/2.0/image-classify/v1/realtime_search/similar/search"
    params = {"image": img_b64_str,"pn":0,"rn":5}
    request_url = request_url + "?access_token=" + access_token
    headers = {'content-type': 'application/x-www-form-urlencoded'}
    resp = requests.post(request_url, data=params, headers=headers)
    if resp:
        result = resp.json()
        print(result)
        rdata = {}
        if result['has_more'] :#true
            tongueid = result['result'][0]['brief']
            score = result['result'][0]['score']
            score = score * 100
            if score >= 80:
                rdata['conclusion'] = "MATCH"
                rdata['score'] = score
                rdata['tongueid'] = tongueid
                rdata['description'] = diagnoselib[tongueid]
                print(">>>rdata:%s"%rdata)
                return HttpResponse(json.dumps(rdata))
            else:
                rdata['conclusion'] = "NOT LIKE"
                rdata['score'] = score
                rdata['tongueid'] = tongueid
                rdata['description'] = diagnoselib[tongueid]
                print(">>>rdata:%s" % rdata)
                return HttpResponse(json.dumps(rdata))
        else:
            rdata['conclusion'] = "FAILED"
            print(">>>rdata:%s" % rdata)
            return HttpResponse(json.dumps(rdata))
    else:
        return HttpResponse(MY_ERROR_SEARCHFAIL)
