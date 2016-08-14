# github-calendar-customizer
A GUI to make customizing one's GitHub contribution calendar easier. 

# [Live editor](http://codepen.io/Zeaklous/full/PzVRBy/)

![](http://i.imgur.com/t3AW7xF.jpg)

![](http://i.imgur.com/UPdgPCE.png)

## Features

- Image-to-calendar format conversion
- Click and drag graphical editor
- Undo/redo capabilities
- Accepts valid input in Gitfiti or GitHub Board formats
- Optionally cuts off additional zeros

## How to use

### Create the image to be used

- Use [the editor](http://codepen.io/Zeaklous/full/PzVRBy/) to create the look you want.
- Once you're satisfied, copy the outputted array and save it to a text file.

### Create the fake commits from the generated array

The rest of the tutorial uses [Gitfiti](https://github.com/gelstudios/gitfiti) to create the false commits, but you could also use something like [GitHub Board](https://github.com/bayandin/github-board):

- Make sure Python is installed. If it's not, you can [download it here](https://www.python.org/downloads/).
- Download a copy of [gitfiti.py](https://github.com/gelstudios/gitfiti/blob/master/gitfiti.py).
- [Create a new GitHub repository](https://help.github.com/articles/create-a-repo/) to use (so you can easily remove it later if desired).
- Open up the command prompt in the directory of the `gitfiti.py` and execute the command `python gitfiti.py`. After [following the steps](http://i.imgur.com/qjgqoEk.png), this will create a file called `gifiti.sh`.
- Move the newly created `gitfiti.sh` to the a directory where you want the GitHub repository to be initialized on your computer. I put mine in `<User>/Documents/GitHub/`
- Navigate to that directory and run `sh gitfiti.sh` and wait. Depending on how large and how many commits it has to make, it may take a few minutes.
- Once it is complete, you should sync it with the online GitHub repository.

For more information, look at [Gitfiti's Usage section](https://github.com/gelstudios/gitfiti#usage).

___

The image loader functionality is meant to be a ***base*** and likely needs editing after the initial load to look right.

## Image Guidelines

- Use images with a high light contrast (try replacing darker colors with lighter ones or lighter ones with darker ones)
- Use simple shapes (remember, there are only 7 pixels of detail)
- Make the desired content fill the image (no extra spacing around edges)
- Filled objects work much better than ones with just outlines
- Try to get the proportions correct (given the height is 7, fit parts of images to that ratio)


## Examples

[View shared templates or share your own!](https://github.com/ZachSaucier/github-calendar-customizer/issues/1)!

Pokeball

![](http://i.imgur.com/96Ah7dw.png)

Name

![](http://i.imgur.com/5tAmj24.png)

Rectangle

![](http://imgur.com/nyP35KK.png)


Special thanks to [GelStudios](https://github.com/gelstudios) for creating [Gitfiti](https://github.com/gelstudios/gitfiti) and to [Sebastiaan Deckers](https://github.com/cbas) for the styling of the [Gitifi color choosers](http://codepen.io/cbas/pen/vOXeKV).