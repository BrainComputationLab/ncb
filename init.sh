export NVM_DIR="$HOME/.nvm"
source $HOME/.nvm/nvm.sh
nvm use 0.10

if [ ! -d "py-ncb" ]; then
    virtualenv py-ncb 
    pip install -r requirements.txt
fi

. py-ncb/bin/activate
