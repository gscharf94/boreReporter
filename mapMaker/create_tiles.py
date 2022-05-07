from PIL import Image
import os
import math

folder_path = "/home/gustavo/Documents/programming_stuff/map_stuff/mapMaker/images"
job_name = "P4746"
page_id = 2

im = Image.open(f'{folder_path}/{job_name}/{page_id}.jpg')
im.save('testing.jpg')

w, h = im.size

print(w, h)

# test_image = Image.new('RGB', (256, 256), color="blue")
# test_image.save('test_image.jpg')

resized = im.resize((256, 160))
resized.save('resized.png')
