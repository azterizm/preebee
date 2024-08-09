WORKING_DIR='/home/abdiel/Code/preebee/seller-dashboard/'
REMOTE_SERVER='root@176.57.189.216'
PACKAGE_NAME=$(tr -dc A-Za-z0-9 </dev/urandom | head -c 13; echo)
PROJECT_NAME='seller-dashboard'

cd $WORKING_DIR

# Build
npm run build

# Package
zip -r $PACKAGE_NAME.zip build .env.production package.json server.js remix.config.js public package-lock.json

# Transfer
sftp $REMOTE_SERVER <<EOF
put $PACKAGE_NAME.zip
exit
EOF

# Deploy
ssh $REMOTE_SERVER <<EOF
rm -rf $PROJECT_NAME
mkdir $PROJECT_NAME
mv $PACKAGE_NAME.zip $PROJECT_NAME
cd $PROJECT_NAME
unzip $PACKAGE_NAME.zip
rm $PACKAGE_NAME.zip
mv .env.production .env
npm install --omit=dev
cd .. 
npx prisma generate
pm2 restart $PROJECT_NAME
exit
EOF

# Cleanup
cd $WORKING_DIR
rm -rf $PACKAGE_NAME.zip 

echo "Deployed Seller Dashboard to $REMOTE_SERVER"

