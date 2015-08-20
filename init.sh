export NVM_DIR="$HOME/.nvm"
source $HOME/.nvm/nvm.sh
nvm use 0.10

if [ ! -d "py-ncb" ]; then
    virtualenv py-ncb 
    . py-ncb/bin/activate
    pip install -r requirements.txt
else
    . py-ncb/bin/activate
fi
