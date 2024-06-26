from flask import Flask, request, jsonify # may require you to run `pip install flask` on your machine
from flask_cors import CORS # `pip install -U flask-cors`
from services import *

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# home page of backend
@app.route("/")
def main():
  return "hello world!"
# make similar "pages" that handle get, post, etc. requests to api.


##########################################################################
# here we verify users and call the appropriate service for the endpoint #
##########################################################################


#This route handles Get and Post requests to the overall database
@app.route('/api/customers/timeline', methods =['GET'])
def risk_assessment():
  sid = request.args.get('sid')
  email = request.args.get('emailAddress')
  data = verify_sid(sid, email)

  if data!=None and data.startswith('0x'): # has smart contract
    return get_risk_timeline(data), 200
  
  return {'error', 'unknown user'}, 400

@app.route('/api/customers', methods=['GET','POST'])  #define /customers endpoint for methods Get and Post
def customers_Request():
  sid = request.args.get('sid')
  email = request.args.get('emailAddress')
  if request.method == 'GET' :
    user = verify_sid(sid, email)
    if user.startswith('0x'):
      return get_customer(user), 200
    elif user=="third-party":
      return get_customer_emails()
    
  # send update to blockchain
  elif request.method == 'POST':
      user = verify_sid(sid, email)
      data = request.get_json()
      print("LOGGED IN")
      if user.startswith('0x'):
        
        
        return update_customer(user, data), 200  #return the data in a dictionary in json format alongside status 201(Created)
      elif user=="third-party":
        customer = request.args.get('customer')
        if customer in users.Users:
          contract = users.get_data(customer)
          print("GOT HERE" + str(contract))
          return update_customer(contract, data), 200
    

# @app.route('/api/customers/<int:id>/<string:itemtoAccess>', methods=['GET', 'PUT', 'DELETE']) #define /customers/id/itemtoAccess endpoint for methods Get, Post and Delete
# def customer_Item_Request(id, itemtoAccess):                                                              #if passed id is present in databse
#   if id in db.customerDatabase:
#     if request.method == 'GET':                                                            #  if request is a Get
#       customer = get_customer(id, itemtoAccess)
#       if customer != None:           #    if passed item is in customer with passed id or passed item is "all"
#         return customer, 200                                         #      return corresponding item and status code 200(OK)
#       else:                                                                                #      else return item not found error and status 404(Not Found)
#         return {'error' : 'item not found'}, 400   
#     elif request.method == 'PUT':                                                         #  else if request is a Post
#                                             #    if itemtoAccess does not already exist in specified customer   
#       newItem = str(request.get_data())                                                      #      store passed json in newItem                                 
#       customer = update_item(id, newItem, itemtoAccess)
#       return customer, 201                                          #      return specified customer and status 201(Created)
#     elif request.method == 'DELETE':                                                       #  else if request is Delete
#                  #    if itemtoAccess exists or is "all"
#                                                              #      delete specified customer's item or all customer's data
#         return customer_delete(id, itemtoAccess), 204                                                       #      return error code 204(No Content)
#   #      else:                                                                                #    else return item not found error and status 404(Not Found)
#   return {'error' : 'id or item not found'}, 400
#   # 404 is not used like this, its used when the api endpoint was not found
  
# @app.route('/api/customers/<int:id>', methods=['GET', 'PUT'])   #define endpoint /customers/id/update for method Patch
# def update_Customer(id): 
#   if id in db.customerDatabase:                                  #if id is present in database
#     if request.method == 'PUT':
#       updatedValues = request.get_json()                        # store json passed with the request in updatedValues                       
#       return update_customer(id, updatedValues), 200   # return customer's data along with status 200(OK)
#     elif request.method == 'GET':
#       return get_customer(id), 200
#   else:
    # return {'error' : 'id not found'}, 400                    #else return error id not found and status 404(Not Found)

@app.route('/api/login', methods=['POST', 'GET', 'DELETE', 'PUT'])
def login_to_Account():
  arguments = request.args
  emailAddress = arguments.get("emailAddress", "")
  print(emailAddress)
  #sid = arguments.get()
  #for POST request, url must be /api/login?emailAddress=x
  #where x is email address to be used to sign up
  if request.method == 'POST':
    if emailAddress not in users.Users:
      password = arguments.get("password")
      sid = add_user(emailAddress, password)
      return sid, 201
    else:
      return {'error' : 'Email Address already in use'}, 403
  #for GET request, url must be /api/login?emailAddress=x&password=y
  #where x is email address and y is password used to sign in  
  elif request.method == 'GET':     
    if emailAddress in users.Users:
      password = arguments.get("password", "")
      result = login(emailAddress, password)
      if result == None:
        return {'error' : 'Your password is incorrect'}, 403
      else:
        return result, 200 # return session id for user
    else:
      return {'error' : 'invalid email address'}, 400
  #Delete request, assuming we don't want to keep tag
  #Url should be in the form /api/login?emailAddress=x    where x is email Address to delete
  elif request.method == 'DELETE':
    sid = arguments.get("sid", "")
    if emailAddress in users.Users:
      sid = users.search_Sessions(emailAddress)
      if delete_user(sid, emailAddress):
        return "Deletion successful", 204
      return {'error': 'access restriceted'}, 400
    else: 
      return {'error': 'invalid email address'}, 400  
  #Put request used for modifying User password
  #Url should be in form /api/login?emailAddress=x&newPassword=y
  elif request.method == 'PUT':
    sid = arguments.get("sid", "")
    if emailAddress in users.Users:
      sid = users.search_Sessions(emailAddress)
      result = change_password(sid, emailAddress, arguments)
      #return jsonify(Users[emailAddress])
      if result == None:
        return {'error': ''}, 403
      else:
        return result, 200
    else:
      return {'error': 'invalid email address'}, 400

# for admin and third-party use
@app.route('/api/third-party', methods=['GET', 'POST'])
def apply_for_access():
  arguments = request.args
  email = arguments.get('emailAddress', '')
  if request.method=='GET':
    sid = arguments.get('sid', '')
    result = verify_sid(sid, email)
    if result == 'admin':
      return get_pending_applications(sid, email), 200
    return {'error': 'access restricted'}, 403
  elif request.method=='POST':
    password = arguments.get('password', None)
    if email!='' and password!=None:
      try:
        msg = request.get_data().decode()
      except:
        msg = arguments.get('msg', '')
      make_third_party_application(email, password, msg)
      return "success", 201
    return {'error': 'please add request parameters `emailAddress` and `password`'}, 400
  return "", 400
    
# for admin use
@app.route('/api/approval', methods=['POST'])
def approve_application():
  arguments = request.args
  email = arguments.get('emailAddress', '')
  if request.method == 'POST':
    sid = arguments.get('sid', '')
    data = verify_sid(sid, email)
    if data!=None and data=="admin":
      index = int(request.get_data().decode())
      approve_third_party(index)
      return "sucess", 201
    return {'error': 'access restricted'}, 403
  return "", 400

if __name__ == '__main__':
  app.run()


