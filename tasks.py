import os
import platform
import shutil
from datetime import datetime
from distutils.spawn import find_executable

from invoke import run
from invoke import task

IS_WINDOWS = platform.system() == 'Windows'

bcolors = {
    'HEADER': '\033[95m',
    'OKBLUE': '\033[94m',
    'OKGREEN': '\033[92m',
    'WARNING': '\033[93m',
    'FAIL': '\033[91m',
    'ENDC': '\033[0m',
    'BOLD': '\033[1m',
    'UNDERLINE': '\033[4m'
}


@task(default=True)
def default(ctx):
    run("invoke --list")

@task
def download(ctx):
    gae_download_link="https://storage.googleapis.com/appengine-sdks/featured/google_appengine_1.9.38.zip"
    run("cd ..; wget -O google_appengine.zip %s  ; unzip -q -o google_appengine.zip" % gae_download_link)


@task
def install(ctx):
    if not find_executable("npm"):
        print "Please install Nodejs"
    else:
        run("npm config set registry http://registry.npmjs.org/")
    if not find_executable("grunt"):
        print "Installing grunt ..."
        run("sudo npm i -g grunt --loglevel info")
    if not find_executable("bower"):
        print "Installing bower ..."
        run("sudo npm i -g bower --loglevel info")

    print "Updating grunt dependencies ..."
    run("npm up")
    print "Updating python libraries ..."
    run("pip install -r requirements.txt --upgrade --target ./libx")  # python
    # install endpoints
    endpoints_proto_datastore = "https://github.com/GoogleCloudPlatform/endpoints-proto-datastore/blob/zipfile-branch/endpoints_proto_datastore.zip?raw=true"
    run('wget  "%s" -O "endpoints_proto_datastore.zip" ' % endpoints_proto_datastore)
    run("unzip endpoints_proto_datastore.zip -d ./libx")
    run("rm endpoints_proto_datastore.zip")
    print "Updating js libraries ..."
    run("bower install --allow-root")  # js


@task
def build(ctx,prod=False):
    cmd = "grunt %s" % ("prod" if prod else "")
    run(cmd)


@task
def clean(ctx, force=False):
    if force:
        if raw_input("Are you sure to run clean, you will lose any file not added to git? y/[n]") == "y":
            run("git clean -xfd")
    else:
        bad_endings = ['pyc', 'pyo', '~']
        print_out(
            'CLEAN FILES ' + bcolors['ENDC'],
            'Removing files: %s' % ', '.join(['*%s' % e for e in bad_endings]),
        )
        for root, _, files in os.walk('.'):
            for filename in files:
                for bad_ending in bad_endings:
                    if filename.endswith(bad_ending):
                        remove_file_dir(os.path.join(root, filename))


@task
def start(ctx):
    gae_path = find_gae_path()
    if gae_path:
        run("grunt watch &")
        run(gae_path+ "/dev_appserver.py ./ --port 8090 --datastore_path=iogrow_local.datastore")
    if not find_executable("dev_appserver.py"):
        print "Add Google App engine SDK to PATH:"
        print "$ export PATH=$PATH:/path/to/google_appengine"


@task
def deploy(ctx):
    if not os.access("crm/config/prod.py", os.R_OK):
        print bcolors['FAIL']+bcolors['BOLD'] + \
              "please provide production config file (crm/config/prod.py) does not exist" + bcolors['ENDC']
        return
    gae_path = find_gae_path()
    if gae_path:
        run(gae_path + "/appcfg.py update ./")
    else:
        print "Add Google App engine SDK to PATH"
        print "$ export PATH=$PATH:/path/to/google_appengine"


@task
def test(ctx, oauth=False):
    gae_path = find_gae_path()
    print "gae_path == %s ;" % gae_path
    run("python test_runner.py {0} crm/tests".format(gae_path))
    if oauth:
        run("python test_runner.py {0} crm/tests/oauth".format(gae_path))


@task
def babel(ctx, extract=False, init=False, compile=False, update=False):
    if not find_executable("pybabel"):
        print "Installing babel ..."
        run("sudo pip install babel")

    if not (init or extract or compile or update):
        print "Please choose a command: \n --init, -i \n --extract, -e \n --compile, -c \n --update, -u"

    pot_path = "./locale/messages.pot"
    if init:
        lang = raw_input("language to initialize?")
        run("pybabel init -l %s -d ./locale -i %s" % (lang, pot_path))
    if extract or update:
        run("pybabel extract -F ./locale/babel.cfg -o %s ./  --no-location  --sort-output" % pot_path)
        LANGS = ["ar", "en_US", "es_ES", "fr_FR", "pt_BR" ]
        for lang in LANGS:
            run("pybabel update -l %s -d ./locale -i %s --previous --ignore-obsolete" % (lang, pot_path))
    if compile:
        run("pybabel compile -f -d ./locale")


def print_out(script, filename=''):
    timestamp = datetime.now().strftime('%H:%M:%S')
    if not filename:
        filename = '-' * 46
        script = script.rjust(12, '-')
    print '[%s] %12s %s' % (timestamp, script, filename)


def remove_file_dir(file_dir):
    if os.path.exists(file_dir):
        if os.path.isdir(file_dir):
            shutil.rmtree(file_dir)
        else:
            os.remove(file_dir)


def find_gae_path():
    GAE_PATH = ''
    GAE_PATH_ALT="../google_appengine/"
    if IS_WINDOWS:
        gae_path = None
        for path in os.environ['PATH'].split(os.pathsep):
            if os.path.isfile(os.path.join(path, 'dev_appserver.py')):
                gae_path = path
    else:

        gae_path = find_executable('dev_appserver.py')
        if gae_path:
            gae_path = os.path.dirname(os.path.realpath(gae_path))

    if not gae_path:
        return GAE_PATH_ALT

    gcloud_exec = 'gcloud.cmd' if IS_WINDOWS else 'gcloud'
    if not os.path.isfile(os.path.join(gae_path, gcloud_exec)):
        GAE_PATH = gae_path

    else:
        gae_path = os.path.join(gae_path, '..', 'platform', 'google_appengine')
        if os.path.exists(gae_path):
            GAE_PATH = os.path.realpath(gae_path)

    return GAE_PATH or GAE_PATH_ALT
