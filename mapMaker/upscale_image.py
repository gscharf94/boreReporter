from PIL import Image

folder_path = "/home/gustavo/Documents/programming_stuff/map_stuff/mapMaker/images"
image_path = "/home/gustavo/Documents/programming_stuff/map_stuff/mapMaker/images/p4737/sh2.png"
job_name = 'P4746'
page_id = '2'


def upscale_image(job_name, page_id):
    file_path = f'{folder_path}/{job_name}/{page_id}.jpg'
    im = Image.open(file_path)
    im.save(f'{folder_path}/{job_name}/{page_id}.png')

    w, h = im.size

    double_im = im.resize((w*2, h*2))
    double_im.save(f'{folder_path}/{job_name}/{page_id}-double.png')

    quadruple_im = im.resize((w*4, h*4))
    quadruple_im.save(f'{folder_path}/{job_name}/{page_id}-quadruple.png')


upscale_image(job_name, page_id)
