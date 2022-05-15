from PIL import Image
import os
import math

tile_size = 256
folder_path = "/home/gustavo/Documents/programming_stuff/map_stuff/mapMaker/images"


def create_tiles(job_name, page_id):
    image_path = f'{folder_path}/{job_name}/{page_id}.jpg'
    im = Image.open(image_path)

    w, h = im.size
    im_sixteenth = im.resize((int(w/8), int(h/8)))
    im_quarter = im.resize((int(w/4), int(h/4)))
    im_half = im.resize((int(w/2), int(h/2)))
    im_double = im.resize((w*2, h*2))
    im_quadruple = im.resize((w*4, h*4))

    save_tiles(im_sixteenth, 2, tile_size, job_name, page_id)
    save_tiles(im_quarter, 3, tile_size, job_name, page_id)
    save_tiles(im_half, 4, tile_size, job_name, page_id)
    save_tiles(im, 5, tile_size, job_name, page_id)
    save_tiles(im_double, 6, tile_size, job_name, page_id)
    save_tiles(im_quadruple, 7, tile_size, job_name, page_id)


def create_folders(job_name, x_splits, zoom_level, page_id):
    job_folder = "/home/gustavo/Documents/programming_stuff/map_stuff/public/images/" + job_name
    try:
        os.mkdir(job_folder)
    except:
        pass
    try:
        os.mkdir(f'{job_folder}/{page_id}')
    except:
        pass
    try:
        os.mkdir(f'{job_folder}/{page_id}/{zoom_level}')
    except:
        pass
    for i in range(x_splits):
        try:
            os.mkdir(f'{job_folder}/{page_id}/{zoom_level}/{i}')
        except:
            pass


def save_tiles(image, zoom_level, tile_size, job_name, page_id):
    h_splits = int(math.ceil(image.size[0]/tile_size))
    v_splits = int(math.ceil(image.size[1]/tile_size))

    create_folders(job_name, h_splits, zoom_level, page_id)

    for y in range(v_splits):
        for x in range(h_splits):
            l = x * tile_size
            t = y * tile_size
            r = (x*tile_size) + tile_size
            b = (y * tile_size) + tile_size
            tile = image.crop((l, t, r, b))
            tile.save(
                f'/home/gustavo/Documents/programming_stuff/map_stuff/public/images/{job_name}/{page_id}/{zoom_level}/{x}/{y}.jpg')


job_name = "P4772"

# t_jobs = ["T650W", "T648W", "T647W", "T645W", "T643W", "T641W"]
# jobs = ["P4737", "P4746", "P4765", "P4772"]

# for job in jobs:
# create_tiles(job, 2)

# create_tiles(job_name, 2)
create_tiles(job_name, 3)
create_tiles(job_name, 4)
create_tiles(job_name, 5)
# create_tiles(job_name, 6)
