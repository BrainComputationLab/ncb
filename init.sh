if [ ! -d "$HOME/.nvm" ]; then
    curl https://raw.githubusercontent.com/creationix/nvm/v0.7.0/install.sh | sh
    export NVM_DIR="$HOME/.nvm"
    source $HOME/.nvm/nvm.sh
    nvm install 0.10
    echo "Please restart terminal"
else
    export NVM_DIR="$HOME/.nvm"
    source $HOME/.nvm/nvm.sh
    nvm use 0.10

    if [ ! -d "node_modules" ]; then
        npm install
        npm install -g bower --config.interactive=false
        npm install mersenne-twister
        bower update
        npm install -g gulp-cli
    fi

    if [ ! -d "py-ncb" ]; then
        virtualenv py-ncb 
        . py-ncb/bin/activate
        pip install -r requirements.txt
    else
        . py-ncb/bin/activate
    fi
fi
