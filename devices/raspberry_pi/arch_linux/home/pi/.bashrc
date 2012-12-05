#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
PS1='[\u@\h \W]\$ '

cd src/mavelous/
python2 mavproxy.py --master=/dev/ttyAMA0 --baud=57600 --module=mavelous
