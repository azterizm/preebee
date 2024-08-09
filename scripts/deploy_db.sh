WORKING_DIR='/home/abdiel/Code/preebee/'
REMOTE_SERVER='root@176.57.189.216'
PACKAGE_NAME='prisma'

cd $WORKING_DIR


# Package
zip -r $PACKAGE_NAME.zip prisma .env.production package.json package-lock.json

# Transfer
sftp $REMOTE_SERVER <<EOF
put $PACKAGE_NAME.zip
exit
EOF

# Deploy
ssh $REMOTE_SERVER <<EOF
rm -rf prisma .env.production package.json package-lock.json node_modules
unzip $PACKAGE_NAME.zip
rm -rf $PACKAGE_NAME.zip
mv .env.production .env
npm install --omit=dev
npx prisma migrate deploy
npx prisma generate
pm2 restart all
EOF

# Cleanup
cd $WORKING_DIR
rm -rf $PACKAGE_NAME.zip 

echo "Deployed DB to $REMOTE_SERVER"

