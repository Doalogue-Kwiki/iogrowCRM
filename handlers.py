# Standard libs
import httplib2
import json
import os
import datetime
from webapp2_extras import sessions
from webapp2_extras import i18n
import webapp2
import datetime
import time
import re
import jinja2
import random
import sys
from discovery import Discovery
from google.appengine._internal.django.utils.encoding import smart_str
# Google libs
import endpoints
from google.appengine.ext import ndb
from google.appengine.api import memcache
from google.appengine.api import taskqueue
from google.appengine.api import urlfetch
from google.appengine.api import mail
from apiclient import errors
from apiclient.discovery import build
from apiclient.http import BatchHttpRequest
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError
from oauth2client.appengine import OAuth2Decorator

# Our libraries
from iomodels.crmengine.shows import Show
from endpoints_helper import EndpointsHelper , OAuth2TokenFromCredentials
from people import linked_in
import model
from iomodels.crmengine.contacts import Contact
from iomodels.crmengine.leads import LeadInsertRequest,Lead
from iomodels.crmengine.Licenses import License
from iomodels.crmengine.documents import Document
from iomodels.crmengine.tags import Tag,TagSchema
import iomessages
from blog import Article
from iograph import Node , Edge
# import event . hadji hicham 09-07-2014
from iomodels.crmengine.events import Event
from iomodels.crmengine.tasks import Task,AssignedGoogleId
from iomodels.crmengine.gcontacts import Gcontact 
import sfoauth2
from sf_importer_helper import SfImporterHelper
from discovery import Discovery, Crawling

# under the test .beata !
from ioreporting import Reports
import stripe
import requests
import config as config_urls 
import people
from intercom import Intercom
from simple_salesforce import Salesforce
from semantic.dates import DateService

import atom.data
import gdata.data
import gdata.contacts.client
import gdata.contacts.data
from gdata.gauth import OAuth2Token
from gdata.contacts.client import ContactsClient

from mapreduce import operation as op


Intercom.app_id = 's9iirr8w'
Intercom.api_key = 'ae6840157a134d6123eb95ab0770879367947ad9'
jinja_environment = jinja2.Environment(
  loader=jinja2.FileSystemLoader(os.getcwd()),
  extensions=['jinja2.ext.i18n'],cache_size=0)
jinja_environment.install_gettext_translations(i18n)

sfoauth2.SF_INSTANCE = 'na12'

ADMIN_EMAILS = ['tedj.meabiou@gmail.com','hakim@iogrow.com']

CLIENT_ID = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_id']

CLIENT_SECRET = json.loads(
    open('client_secrets.json', 'r').read())['web']['client_secret']

SCOPES = [
    'https://mail.google.com https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar'
]
DEOCORATOR_SCOPES=['https://www.googleapis.com/auth/userinfo.email https://mail.google.com https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar']
decorator = OAuth2Decorator(
  client_id= CLIENT_ID,
  client_secret=CLIENT_SECRET,
  scope=DEOCORATOR_SCOPES,
  access_type='online'
  )

VISIBLE_ACTIONS = [
    'http://schemas.google.com/AddActivity',
    'http://schemas.google.com/ReviewActivity'
]

TOKEN_INFO_ENDPOINT = ('https://www.googleapis.com/oauth2/v1/tokeninfo' +
    '?access_token=%s')
TOKEN_REVOKE_ENDPOINT = 'https://accounts.google.com/o/oauth2/revoke?token=%s'

FOLDERS_ATTR = {
            'Account': 'accounts_folder',
            'Contact': 'contacts_folder',
            'Lead': 'leads_folder',
            'Opportunity': 'opportunities_folder',
            'Case': 'cases_folder',
            'Show': 'shows_folder',
            'Feedback': 'feedbacks_folder'
        }
FOLDERS = {
            'Accounts': 'accounts_folder',
            'Contacts': 'contacts_folder',
            'Leads': 'leads_folder',
            'Opportunities': 'opportunities_folder',
            'Cases': 'cases_folder'
        }
folders = {}

class BaseHandler(webapp2.RequestHandler):
    def set_user_locale(self,language=None):
        if language:
            locale = self.request.GET.get('locale', 'en-US')
            i18n.get_i18n().set_locale(language)

        else:
            locale = self.request.GET.get('locale', 'en-US')
            i18n.get_i18n().set_locale('en')


    def prepare_template(self,template_name):
        is_admin = False
        is_owner=False
        template_values={
                  'is_admin':is_admin
                  }
        admin_app=None
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            if user is not None:
                #find out if the user is admin or no 
                is_not_a_life_time=True
                is_freemium=True
                if template_name =="templates/admin/users/user_list.html":
                    organization=user.organization.get()
                    if organization.owner==user.google_user_id:
                       is_owner=True
                    if Edge.find(user.organization,[user.key],'admins',"AND"):
                        is_admin=True
                    else:
                        is_admin=False
                    plan=organization.plan.get()
                    if plan.name=="life_time_free":
                        is_not_a_life_time=False
                    if plan.name=="preemium":
                        is_freemium=False
                                               
                # if user.email in ADMIN_EMAILS:
                #     is_admin = True
                # Set the user locale from user's settings
                self.set_user_locale(user.language)
                tabs = user.get_user_active_tabs()
                
                # Set the user locale from user's settings
                self.set_user_locale(user.language)
                # Render the template
                active_app = user.get_user_active_app()
                apps = user.get_user_apps()
                is_business_user = bool(user.type=='business_user')
                applications = []
                for app in apps:
                    if app is not None:
                        applications.append(app)
                        if app.name=='admin':
                            admin_app = app

                # prepare custom_fields builder
                template_mapping = {
                                    'templates/leads/lead_new.html':'leads',  
                                    'templates/leads/lead_show.html':'leads' 
                }
                custom_fields = []
                if template_name in template_mapping.keys():
                    custom_fields = model.CustomField.list_by_object(user,template_mapping[template_name])
                #text=i18n.gettext('Hello, world!')
                template_values={
                          'is_freemium':is_freemium,
                          'is_admin':is_admin,
                          'is_not_a_life_time':is_not_a_life_time,
                          'is_business_user':is_business_user,
                          'ME':user.google_user_id,
                          'active_app':active_app,
                          'apps':applications,
                          'tabs':tabs,
                          'admin_app':admin_app,
                          'organization_key':user.organization.urlsafe(),
                          'is_owner':is_owner,
                          'user':user,
                          'custom_fields':custom_fields
                          }
        template = jinja_environment.get_template(template_name)
        self.response.out.write(template.render(template_values))

class SessionEnabledHandler(webapp2.RequestHandler):
    """Base type which ensures that derived types always have an HTTP session."""
    CURRENT_USER_SESSION_KEY = 'me'

    def dispatch(self):
        """Intercepts default request dispatching to ensure that an HTTP session
        has been created before calling dispatch in the base type.
        """
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)
        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        """Returns a session using the default cookie key."""
        return self.session_store.get_session()

    def get_user_from_session(self):
        """Convenience method for retrieving the users crendentials from an
        authenticated session.
        """
        email = self.session.get(self.CURRENT_USER_SESSION_KEY)
        if email is None:
          raise UserNotAuthorizedException('Session did not contain user email.')
        user = model.User.get_by_email(email)
        return user

class UserNotAuthorizedException(Exception):
    msg = 'Unauthorized request.'

class NotFoundException(Exception):
    msg = 'Resource not found.'

class RevokeException(Exception):
    msg = 'Failed to revoke token for given user.'

class WelcomeHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/index_opt.html')
        self.response.out.write(template.render(template_values))

class NewWelcomeHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {'CLIENT_ID':CLIENT_ID}
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            try:
                user = self.get_user_from_session()
                print user
                template_values = {
                                    'user':user,
                                    'CLIENT_ID':CLIENT_ID
                                    }
            except:
                print 'an error has occured'
        template = jinja_environment.get_template('templates/new_web_site/index_opt.html')
        self.response.out.write(template.render(template_values))


class NewSignInHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        offline_access_prompt = True
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            try:
                user = self.get_user_from_session()
                # Set the user locale from user's settings
                user_id = self.request.get('id')
                lang = self.request.get('language')
                self.set_user_locale(lang)
                if user:
                    if user.google_credentials:
                        if user.google_credentials.__dict__['refresh_token']!=None:
                            offline_access_prompt=False
                    # Render the template
                template_values = {
                                    'offline_access_prompt':offline_access_prompt,
                                    'user':user,
                                    'CLIENT_ID': CLIENT_ID,
                                    'ID' : user_id
                                  }
                template = jinja_environment.get_template('templates/new_web_site/sign-in.html')
                self.response.out.write(template.render(template_values))
            except:
                print 'an error has occured'
        else:
            # Set the user locale from user's settings
            user_id = self.request.get('id')
            lang = self.request.get('language')
            self.set_user_locale(lang)
                # Render the template
            template_values = {
                                'offline_access_prompt':offline_access_prompt,
                                'CLIENT_ID': CLIENT_ID,
                                'ID' : user_id
                              }
            template = jinja_environment.get_template('templates/new_web_site/sign-in.html')
            self.response.out.write(template.render(template_values))

class ChromeExtensionHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/chrome.html')
        self.response.out.write(template.render(template_values))

class SFExtensionHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/salesforce.html')
        self.response.out.write(template.render(template_values))

class TermsOfServicesHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/terms-of-services.html')
        self.response.out.write(template.render(template_values))

class PartnersHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/partners.html')
        self.response.out.write(template.render(template_values))
class WikiHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('wiki')
        self.response.out.write(template.render(template_values))

class PrivacyHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/privacy-policy.html')
        self.response.out.write(template.render(template_values))

class SecurityInformationsHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/security-informations.html')
        self.response.out.write(template.render(template_values))

class CrossLocalStorageHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/new_web_site/xdLocalStorage.html')
        self.response.out.write(template.render(template_values))


class StripeHandler(BaseHandler,SessionEnabledHandler):
    def post(self):
       

        # Get the credit card details submitted by the form
        
        # Set your secret key: remember to change this to your live secret key in production
        # See your keys here https://dashboard.stripe.com/account
        #stripe.api_key = "sk_test_4ZNpoS4mqf3YVHKVfQF7US1R"
        stripe.api_key ="sk_live_4Xa3GqOsFf2NE7eDcX6Dz2WA"

        # Get the credit card details submitted by the form
        token = self.request.get('stripeToken')

        # Create a Customer
        customer = stripe.Customer.create(
            card=token,
            description="payinguser@example.com"
        )

        # Charge the Customer instead of the card
        stripe.Charge.create(
            amount=1000, # in cents
            currency="usd",
            customer=customer.id
        )

        # Save the customer ID in your database so you can use it later
        save_stripe_customer_id(user, customer.id)

        # Later...
        customer_id = get_stripe_customer_id(user)

        stripe.Charge.create(
            amount=1500, # $15.00 this time
            currency="usd",
            customer=customer_id
        )

class IndexHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        # Check if the user is loged-in, if not redirect him to the sign-in page
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            try:
                user = self.get_user_from_session()
                if user is None:
                    self.redirect('/welcome/')
                    return
                if user.google_credentials is None:
                    self.redirect('/sign-in')
                logout_url = 'https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://www.iogrow.com/welcome/'
                if user is None or user.type=='public_user':
                    self.redirect('/welcome/')
                    return
                # Set the user locale from user's settings
                self.set_user_locale(user.language)
                uSerid = user.key.id()
                uSerlanguage = user.language
                user_suspended=False
                license_is_expired=False
                apps = user.get_user_apps()
                admin_app = None
                active_app = user.get_user_active_app()
                tabs = user.get_user_active_tabs()
                applications = []
                for app in apps:
                    if app is not None:
                        applications.append(app)
                        if app.name=='admin':
                            admin_app = app
                        elif app.name =='sales':
                            sales_app=app
                logo=model.Logo.query(model.Logo.organization==user.organization).get()
                organization=user.organization.get()
                plan=organization.plan.get()
                if plan.name !="life_time_free":    
                   now = datetime.datetime.now()
                   if organization.licenses_expires_on:
                       days_before_expiring = organization.licenses_expires_on - now
                       expires=days_before_expiring.days+1
                   else:
                       days_before_expiring = organization.created_at+datetime.timedelta(days=30)-now
                       expires=days_before_expiring.days+1
                   if expires<=0:
                      license_is_expired=True
                if user.license_status=="suspended":
                    user_suspended=True
                template_values = {
                                  'logo':logo,
                                  'license_is_expired':False,
                                  'user_suspended':user_suspended,
                                  'tabs':tabs,
                                  'user':user,
                                  'logout_url' : logout_url,
                                  'CLIENT_ID': CLIENT_ID,
                                  'active_app':active_app,
                                  'apps': applications,
                                  'uSerid':uSerid,
                                  'uSerlanguage':uSerlanguage,
                                  'sales_app':sales_app,
                                  'organization_name':organization.name
                                }
                if admin_app:
                    template_values['admin_app']=admin_app
                template = jinja_environment.get_template('templates/base.html')
                self.response.out.write(template.render(template_values))
            except UserNotAuthorizedException as e:
                self.redirect('/welcome/')
        else:
            self.redirect('/welcome/')
class BlogHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            template_values = {'user':user}
        else:
            template_values = {}
        template = jinja_environment.get_template('templates/blog/blog_base.html')
        self.response.out.write(template.render(template_values))
class PublicArticlePageHandler(BaseHandler,SessionEnabledHandler):
    def get(self,id):
        article = Article.get_schema(id=id)
        template_values = {'article':article}
        template = jinja_environment.get_template('templates/blog/public_article_show.html')
        self.response.out.write(template.render(template_values))

class PublicSupport(BaseHandler,SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/blog/public_support.html')
        self.response.out.write(template.render(template_values))
# Change the current app for example from sales to customer support
class ChangeActiveAppHandler(SessionEnabledHandler):
    def get(self,appid):
        new_app_id = int(appid)
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            # get the active application before the change request
            active_app = user.get_user_active_app()
            new_active_app = model.Application.get_by_id(new_app_id)
            if new_active_app:
              if new_active_app.organization==user.organization:
                  user.set_user_active_app(new_active_app.key)
                  self.redirect(new_active_app.url)
              else:
                  self.redirect('/error')
            else:
                self.redirect('/')
        else:
            self.redirect('/sign-in')
class SignInHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            try:
                user = self.get_user_from_session()
                # Set the user locale from user's settings
                user_id = self.request.get('id')
                lang = self.request.get('language')
                self.set_user_locale(lang)
                    # Render the template
                template_values = {
                                    'user':user,
                                    'CLIENT_ID': CLIENT_ID,
                                    'ID' : user_id
                                  }
                template = jinja_environment.get_template('templates/new_web_site/sign-in.html')
                self.response.out.write(template.render(template_values))
            except:
                print 'an error has occured'
        else:
            # Set the user locale from user's settings
            user_id = self.request.get('id')
            lang = self.request.get('language')
            self.set_user_locale(lang)
                # Render the template
            template_values = {
                                'CLIENT_ID': CLIENT_ID,
                                'ID' : user_id
                              }
            template = jinja_environment.get_template('templates/new_web_site/sign-in.html')
            self.response.out.write(template.render(template_values))

class EarlyBirdHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        # Set the user locale from user's settings
        user_id = self.request.get('id')
        lang = self.request.get('language')
        self.set_user_locale(lang)
            # Render the template
        template_values = {
                            'CLIENT_ID': CLIENT_ID,
                            'ID' : user_id
                          }
        template = jinja_environment.get_template('templates/early-bird.html')
        self.response.out.write(template.render(template_values))

class SignUpHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            template_values = {
              'userinfo': user,
              'CLIENT_ID': CLIENT_ID}
            template = jinja_environment.get_template('templates/new_web_site/sign-up.html')
            self.response.out.write(template.render(template_values))
        else:
            self.redirect('/sign-in')
    @ndb.toplevel
    def post(self):
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            org_name = self.request.get('org_name')
            promo_code = self.request.get('promo_code')
            taskqueue.add(
                            url='/workers/add_to_iogrow_leads',
                            queue_name='iogrow-low',
                            params={
                                    'email': user.email,
                                    'organization': org_name
                                    }
                        )
            print org_name
            print promo_code
            if promo_code!='':
                org_key = model.Organization.create_instance(org_name,user,'premium_trial',promo_code)
            else:
                org_key = model.Organization.create_instance(org_name,user)
            tags = self.request.get('tags').split()
            # colors=["#F7846A","#FFBB22","#EEEE22","#BBE535","#66CCDD","#B5C5C5","#77DDBB","#E874D6"]
            # tagschema=Tag()
            # tagschema.organization = org_key
            # tagschema.owner = user.google_user_id
            # tagschema.name="Growth Hacking"
            # tagschema.about_kind="topics"
            # tagschema.color=random.choice(colors)
            # tagschema.put()
            # try:
            #     payload = {'keyword':"Growth Hacking",'organization':org_key.id()}
            #     r = requests.get(config_urls.nodeio_server+"/twitter/crawlers/insert", params=payload)
            # except:
            #     print "insert keyword"
            
            
            self.redirect('/')
        else:
            self.redirect('/sign-in')

class StartEarlyBird(BaseHandler, SessionEnabledHandler):
    def get(self):
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            template_values = {
              'userinfo': user,
              'CLIENT_ID': CLIENT_ID}
            template = jinja_environment.get_template('templates/sign-up-early-bird.html')
            self.response.out.write(template.render(template_values))
        else:
            self.redirect('/early-bird')
    @ndb.toplevel
    def post(self):
        if self.session.get(SessionEnabledHandler.CURRENT_USER_SESSION_KEY) is not None:
            user = self.get_user_from_session()
            org_name = self.request.get('org_name')
            model.Organization.create_early_bird_instance(org_name,user)
            taskqueue.add(
                            url='/workers/add_to_iogrow_leads',
                            queue_name='iogrow-low',
                            params={
                                    'email': user.email,
                                    'organization': org_name
                                    }
                        )
            self.redirect('/')
        else:
            self.redirect('/early-bird')

class SFConnectHelper(SessionEnabledHandler):
    @staticmethod
    def exchange_code(code):
        """Exchanges the `code` member of the given AccessToken object, and returns
        the relevant credentials.

        Args:
          code: authorization code to exchange.

        Returns:
          Credentials response from Google indicating token information.

        Raises:
          FlowExchangeException Failed to exchange code (code invalid).
        """
        oauth_flow = flow_from_clientsecrets(
                                            'sf_client_secrets.json',
                                            scope=['api']
                                          )
        credentials = oauth_flow.step2_exchange(code)
        return credentials

class GooglePlusConnect(SessionEnabledHandler):
    @staticmethod
    def exchange_code(code):
        """Exchanges the `code` member of the given AccessToken object, and returns
        the relevant credentials.

        Args:
          code: authorization code to exchange.

        Returns:
          Credentials response from Google indicating token information.

        Raises:
          FlowExchangeException Failed to exchange code (code invalid).
        """
        oauth_flow = flow_from_clientsecrets(
                                            'offline_client_secrets.json',
                                            scope=SCOPES
                                          )
        oauth_flow.request_visible_actions = ' '.join(VISIBLE_ACTIONS)
        oauth_flow.redirect_uri = 'postmessage'
        credentials = oauth_flow.step2_exchange(code)
        return credentials
    @staticmethod
    def get_token_info(credentials):
        """Get the token information from Google for the given credentials."""
        url = (TOKEN_INFO_ENDPOINT
               % credentials.access_token)
        print 'i will fetch the url', url
        return urlfetch.fetch(url)

    @staticmethod
    def get_user_profile(credentials):
        """Return the public Google+ profile data for the given user."""
        http = credentials.authorize(httplib2.Http(memcache))
        plus = build('plus', 'v1', http=http)
        return plus.people().get(userId='me').execute()
    @staticmethod
    def get_user_email(credentials):
        """Return the public Google+ profile data for the given user."""
        http = credentials.authorize(httplib2.Http(memcache))
        userinfo = build('oauth2', 'v1', http=http)
        return userinfo.userinfo().get().execute()

    @staticmethod
    def save_token_for_user(email, credentials,user_id=None):
        """Creates a user for the given ID and credential or updates the existing
        user with the existing credential.

        Args:
          google_user_id: Google user ID to update.
          credentials: Credential to set for the user.

        Returns:
          Updated User.
        """
        if user_id:
            user = model.User.get_by_id(user_id)
            userinfo = GooglePlusConnect.get_user_profile(credentials)
            user.status = 'active'
            user.google_user_id = userinfo.get('id')
            user.google_display_name = userinfo.get('displayName')
            user.google_public_profile_url = userinfo.get('url')
            emails = userinfo.get('emails')
            user.email = emails[0]['value']
            profile_image = userinfo.get('image')
            user.google_public_profile_photo_url = profile_image['url']
            invited_by = user.invited_by.get()
            user.organization = invited_by.organization
            user.completed_tour = False
            profile =  model.Profile.query(
                                            model.Profile.name=='Standard User',
                                            model.Profile.organization==invited_by.organization
                                          ).get()
            model.Invitation.delete_by(user.email)
            user.init_user_config(invited_by.organization,profile.key)
        else:
            user = model.User.get_by_email(email)
        if user is None:
            userinfo = GooglePlusConnect.get_user_profile(credentials)
            user = model.User()
            user.type = 'public_user'
            user.status = 'active'
            user.google_user_id = userinfo.get('id')
            user.google_display_name = userinfo.get('displayName')
            user.google_public_profile_url = userinfo.get('url')
            emails = userinfo.get('emails')
            user.email = emails[0]['value']
            user.completed_tour = False
            profile_image = userinfo.get('image')
            user.google_public_profile_photo_url = profile_image['url']
        if user.google_credentials:
            if credentials.__dict__['refresh_token']!=None:
                user.google_credentials = credentials
        else:
            user.google_credentials = credentials
        user_key = user.put_async()
        user_key_async = user_key.get_result()
        if memcache.get(user.email) :
            memcache.set(user.email, user)
        else:
            memcache.add(user.email, user)
        # if not user.google_contacts_group:
        #     taskqueue.add(
        #                     url='/workers/createcontactsgroup',
        #                     queue_name='iogrow-low',
        #                     params={
        #                             'email': user.email
        #                             }
        #                 )
        # if(user.gmail_to_lead_sync):
        #      taskqueue.add(
        #                          url='/workers/init_leads_from_gmail',
        #                          queue_name='iogrow-critical',
        #                          params={
        #                                  'email': user.email
        #                                  }
        #                  )
        taskqueue.add(
                       url='/workers/init_contacts_from_gcontacts',
                       queue_name='iogrow-gontact',
                       params={
                             'key':user.key.urlsafe()
                       }
             )

        return user

    def post(self):
        #try to get the user credentials from the code
        credentials = None
        code = self.request.get("code")
        try:
            credentials = GooglePlusConnect.exchange_code(code)
        except FlowExchangeError:
            return
        token_info = GooglePlusConnect.get_token_info(credentials)
        if token_info.status_code != 200:
            return
        token_info = json.loads(token_info.content)
        # If there was an error in the token info, abort.
        if token_info.get('error') is not None:
            return
        # Make sure the token we got is for our app.
        expr = re.compile("(\d*)(.*).apps.googleusercontent.com")
        issued_to_match = expr.match(token_info.get('issued_to'))
        local_id_match = expr.match(CLIENT_ID)
        if (not issued_to_match
            or not local_id_match
            or issued_to_match.group(1) != local_id_match.group(1)):
            return
        #Check if is it an invitation to sign-in or just a simple sign-in
        invited_user_id = None
        invited_user_id_request = self.request.get("id")
        if invited_user_id_request:
            invited_user_id = long(invited_user_id_request)
        #user = model.User.query(model.User.google_user_id == token_info.get('user_id')).get()

        # Store our credentials with in the datastore with our user.
        if invited_user_id:
            user = GooglePlusConnect.save_token_for_user(
                                                        token_info.get('email'),
                                                        credentials,
                                                        invited_user_id
                                                      )
        else:
            user = GooglePlusConnect.save_token_for_user(
                                                        token_info.get('email'),
                                                        credentials
                                                      )
        # if user doesn't have organization redirect him to sign-up
        isNewUser = False
        if user.organization is None:
            isNewUser = True
            intercom_user = Intercom.create_user(email=user.email,
                                    name=user.google_display_name, 
                                    created_at=time.mktime(user.created_at.timetuple())
                                    )
        # Store the user ID in the session for later use.
        self.session[self.CURRENT_USER_SESSION_KEY] = user.email
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(isNewUser))

class InstallFromDecorator(SessionEnabledHandler):
    @decorator.oauth_required
    def get(self):
        credentials = decorator.get_credentials()
        print credentials.__dict__
        token_info = GooglePlusConnect.get_token_info(credentials)
        print token_info.status_code
        print token_info.content
        if token_info.status_code != 200:
            return
        token_info = json.loads(token_info.content)
        print 'email: ',token_info.get('email')
        # If there was an error in the token info, abort.
        if token_info.get('error') is not None:
            return
        # Make sure the token we got is for our app.
        expr = re.compile("(\d*)(.*).apps.googleusercontent.com")
        issued_to_match = expr.match(token_info.get('issued_to'))
        local_id_match = expr.match(CLIENT_ID)
        if (not issued_to_match
            or not local_id_match
            or issued_to_match.group(1) != local_id_match.group(1)):
            return
        #Check if is it an invitation to sign-in or just a simple sign-in
        invited_user_id = None
        invited_user_id_request = self.request.get("id")
        if invited_user_id_request:
            invited_user_id = long(invited_user_id_request)
        #user = model.User.query(model.User.google_user_id == token_info.get('user_id')).get()

        # Store our credentials with in the datastore with our user.
        if invited_user_id:
            user = GooglePlusConnect.save_token_for_user(
                                                        token_info.get('email'),
                                                        credentials,
                                                        invited_user_id
                                                      )
        else:
            user = GooglePlusConnect.save_token_for_user(
                                                        token_info.get('email'),
                                                        credentials
                                                      )
        print 'user: ', user
        # if user doesn't have organization redirect him to sign-up
        isNewUser = False
        if user.organization is None:
            isNewUser = True
        self.session[self.CURRENT_USER_SESSION_KEY] = user.email
        if isNewUser:
            self.redirect('/sign-up')
        else:
            self.redirect('/')

class ArticleSearchHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/articles/article_search.html')

class ArticleListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/articles/article_list.html')

class ArticleShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/articles/article_show.html')
class ArticleNewHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/articles/article_new.html')

class AccountListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/accounts/account_list.html')

class AccountShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/accounts/account_show.html')
class DiscoverListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/discovers/discover_list.html')
class DiscoverShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/discovers/discover_show.html')
class DiscoverNewHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/discovers/discover_new.html')

class AccountNewHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/accounts/account_new.html')

class ContactListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/contacts/contact_list.html')

class ContactShowHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/contacts/contact_show.html')

class ContactNewHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/contacts/contact_new.html')

class OpportunityListHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/opportunities/opportunity_list.html')

class OpportunityShowHandler(BaseHandler,SessionEnabledHandler):
    def get (self):
        self.prepare_template('templates/opportunities/opportunity_show.html')

class OpportunityNewHandler(BaseHandler,SessionEnabledHandler):
    def get (self):
        self.prepare_template('templates/opportunities/opportunity_new.html')

class LeadListHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/leads/lead_list.html')

class LeadShowHandler(BaseHandler,SessionEnabledHandler):
    def get (self):
        self.prepare_template('templates/leads/lead_show.html')

class LeadNewHandler(BaseHandler,SessionEnabledHandler):
    def get (self):
        self.prepare_template('templates/leads/lead_new.html')

class CaseNewHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/cases/case_new.html')

class CaseListHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/cases/case_list.html')

class CaseShowHandler(BaseHandler,SessionEnabledHandler):
    def get (self):
        self.prepare_template('templates/cases/case_show.html')

class NeedShowHandler(BaseHandler,SessionEnabledHandler):
    def get (self):
        self.prepare_template('templates/needs/show.html')

class NoteShowHandler (BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/accounts/note_show.html')

class DocumentShowHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/documents/show.html')

class AllTasksHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/activities/all_tasks.html')

class TaskShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/activities/task_show.html')

class EventShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/activities/event_show.html')

class ShowListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/live/shows/list_show.html')

class ShowShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/live/shows/show.html')

class UserListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/users/user_list.html')
class UserNewHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/users/user_new.html')

class UserShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/users/user_show.html')
class GroupListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/groups/list.html')

class GroupShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/groups/show.html')

class settingsShowHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/settings/settings.html')
class ImportListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/imports/import_list.html')
class ImportNewHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/admin/imports/import_new.html')

class SearchListHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/search/list.html')
class CalendarShowHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/calendar/calendar_show.html')
# hadji hicham 07/08/2014 
class BillingListHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/billing/billing_list.html')
# hadji hicham  11/08/2014
class BillingShowHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/billing/billing_show.html')
class DashboardHandler(BaseHandler, SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/dashboard.html')
class SalesforceImporter(BaseHandler, SessionEnabledHandler):
    def get(self):
        flow = sfoauth2.SalesforceOAuth2WebServerFlow(
            client_id='3MVG99OxTyEMCQ3g0xwRHkTAQlLtFN1urL1DbjiYCIkwzJkIVOFRgcw2aNy3ibWdJ3_gmnHCQuzkMYi8jWBzj',
            client_secret='3507235941737403648',
            scope=['api'] ,
            redirect_uri='https://gcdc2013-iogrow.appspot.com/sfoauth2callback'
        )
        authorization_url = flow.step1_get_authorize_url()
        self.redirect(authorization_url)

class SFsubscriber(BaseHandler, SessionEnabledHandler):
    def post(self):
        email = self.request.get("email")
        token_str = self.request.get("token")
        token = json.loads(token_str)
        print 'id'
        print token['id']
        
        user = model.SFuser.query(model.SFuser.email==email).get()
        if user:
            stripe.api_key = "sk_live_4Xa3GqOsFf2NE7eDcX6Dz2WA"
            customer = stripe.Customer.create(
              source=token['id'], # obtained from Stripe.js
              plan="linkedin_to_sf",
              email=email
            )
            user_info = user
            user_info.stripe_id = customer['id']
            now = datetime.datetime.now()
            now_plus_month = now+datetime.timedelta(days=30)
            user_info.active_until = now_plus_month
            user_info.put()
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps({}))
class SFconnect(BaseHandler, SessionEnabledHandler):
    def get(self):
        code = self.request.get("code")
        payload = {
            'code':str(code),
            'grant_type':'authorization_code',
            'client_id':'3MVG99OxTyEMCQ3g0xwRHkTAQlLtFN1urL1DbjiYCIkwzJkIVOFRgcw2aNy3ibWdJ3_gmnHCQuzkMYi8jWBzj',
            'client_secret':'3507235941737403648',
            'redirect_uri':'https://gcdc2013-iogrow.appspot.com/sfoauth2callback'
            }
        print payload   
        print '----------- REsult------------ :)'
        endpoint = 'https://login.salesforce.com/services/oauth2/token'
        r = requests.post(endpoint, params=payload)
        content = r.__dict__['_content']
        print content
        try:
            print json.loads(content)
        except:
            print 'no 0'
        try:
            print content.id
        except:
            print 'wahc ya khou'
        json_loads= json.loads(content)
        org_user_id = json_loads['id']
        print org_user_id
        print org_user_id.split('/')
        user_id = str(org_user_id.split('/')[5])
        responseJ = r.json()
        response = {}
        response['access_token'] = str(responseJ['access_token'])
        response['instance_url'] = str(responseJ['instance_url'])
        # print response
        sf = Salesforce(instance_url=response['instance_url'] , session_id=response['access_token'],version='33.0')
        print sf
        print 'try except'
        try:
            print sf.id.__dict__
        except:
            print 'no _content.id'
        print sf.id.request.__dict__['cookies'].__dict__

        userinfo = sf.User.get(user_id)
        print userinfo
        print userinfo['FirstName']
        print userinfo['LastName']
        print userinfo['Email']
        user = model.SFuser.query(model.SFuser.email==userinfo['Email']).get()
        if user is None:
            created_user = model.SFuser(
                                    firstname=userinfo['FirstName'],
                                    lastname=userinfo['LastName'],
                                    email=userinfo['Email']
                                    )
            created_user.put()
        else:
            created_user=user
        response['user_email'] = str(created_user.email)
        free_trial_expiration = created_user.created_at + datetime.timedelta(days=7)
        now = datetime.datetime.now()
        response['show_checkout'] = "true"
        if created_user.active_until:
            if created_user.active_until>now:
                response['show_checkout'] = "false"
        else:
            if now<free_trial_expiration:
                response['show_checkout']="false"
        try:
            intercom_user = Intercom.create_user(email=created_user.email,
                                    name=created_user.firstname + ' ' + created_user.lastname, 
                                    created_at=time.mktime(created_user.created_at.timetuple()),
                                    custom_attributes={'sf_extension':True}
                                    )
            print intercom_user
        except:
            print 'error'
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(response)

class SalesforceImporterCallback(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/salesforce_callback.html')
        self.response.out.write(template.render(template_values))

class GoGo(BaseHandler, SessionEnabledHandler):
    def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/sf.html')
        self.response.out.write(template.render(template_values))

class SFmarkAsLead(BaseHandler, SessionEnabledHandler):
    def post(self):
        try:
            access_token = self.request.get("access_token")
            instance_url = self.request.get("instance_url")
            firstname = self.request.get("firstname")
            lastname = self.request.get("lastname")
            title = self.request.get("title")
            company = self.request.get("company")
            profile_img_url = self.request.get("profile_img_url")
            introduction = self.request.get("introduction")
            city = self.request.get("city")
            country = self.request.get("country")
            formatted_address = self.request.get("formatted_address")
            street = smart_str(formatted_address)
            mobile = self.request.get("mobile")
            email = self.request.get("email")
            twitter = self.request.get("twitter")
            linkedin_url = self.request.get("linkedin_url")
            if twitter!='':
                twitter = 'https://twitter.com/' + twitter
            request = access_token + ' ' + instance_url + ' '+mobile + ' '+email+' '+twitter + ' '+ linkedin_url + ' '+  firstname +' '+ lastname 
            sender_address = "Error SF <error@gcdc2013-iogrow.appspotmail.com>"
            mail.send_mail(sender_address, 'tedj@iogrow.com' , 'error salesforce extension', request )
            sf = Salesforce(instance_url=instance_url, session_id=access_token,version='33.0')
            params = {
                    'FirstName':smart_str(firstname),
                    'LastName':smart_str(lastname),
                    'Company':smart_str(company),
                    'Title':smart_str(title)
                    }
            if street!='':
                params['Street']=street
            if introduction!='':
                params['Description']=smart_str(introduction)
            if mobile!='':
                params['MobilePhone']=smart_str(mobile)
            if email!='':
                params['Email']=smart_str(email)
            if twitter!='':
                params['Website']=smart_str(twitter)
            print 'params'
            print params
            created_lead = sf.Lead.create(params)

            saved_lead = model.SFLead(
                                        firstname=firstname,
                                        lastname=lastname,
                                        sf_id=created_lead['id'][:-3],
                                        photo_url=profile_img_url,
                                        linkedin_url=linkedin_url
                                        ).put()
        except:
            type, value, tb = sys.exc_info()
            sender_address = "Error SF <error@gcdc2013-iogrow.appspotmail.com>"
            mail.send_mail(sender_address, 'tedj@iogrow.com' , 'error salesforce extension', firstname + ' ' + lastname+ ' ' + linkedin_url + ' ' +  str(value.message) )
            created_lead = {}
            created_lead['error']='error sending the lead to salesforce'
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(created_lead))

class SFsearch(BaseHandler, SessionEnabledHandler):
    def post(self):
        access_token = self.request.get("access_token")
        instance_url = self.request.get("instance_url")
        print self.request.remote_addr
        print instance_url
        if access_token=='' or instance_url=='':
            found = 'rouhou trankou'
            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(found)
        else:
            person = self.request.get("person")
            sf = Salesforce(instance_url=instance_url, session_id=access_token,version='30.0')
            search_results = sf.quick_search(person)
            results = []
            if search_results:
                for p in search_results:
                    r = {}
                    r['type'] = str(p['attributes']['type'])
                    r['id'] = str(p['Id'])
                    if r['type'] == 'Lead' or r['type']=='Contact':
                        results.append(r)
            found = {}
            if len(results)>0:
                found = results[0]
            self.response.headers.add_header("Access-Control-Allow-Origin", "*")
            self.response.headers['Content-Type'] = 'application/json'
            self.response.out.write(found)

class SFsearchphoto(BaseHandler, SessionEnabledHandler):
    def get(self):
        sf_lead_id = self.request.get("sf_id")
        response = {}
        if sf_lead_id!='':
            sf_lead = model.SFLead.query(model.SFLead.sf_id==sf_lead_id).get()
            if sf_lead:
                response['photo_url'] = smart_str(sf_lead.photo_url)
                response['linkedin_url']=smart_str(sf_lead.linkedin_url)
            else:
                response['error']='not found'
                response['code']=404
        else:
            response['error']='not found'
            response['code']=404
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(response)

class GoGoP(BaseHandler, SessionEnabledHandler):
    def get(self):
        access_token=code = self.request.get("access_token")
        url = self.request.get("url")
        r = SfImporterHelper.sf_mark_as_lead(access_token,url)
        print '----------------------------'
        print r.__dict__
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps({}))

class ioAdminHandler(BaseHandler,SessionEnabledHandler):
    def get(self):
        self.prepare_template('templates/ioadmin.html')

# class GBizCompanies(BaseHandler,SessionEnabledHandler):
#     def get(self):
        
#         users = model.User.query().fetch()
#         companies={}
#         for user in users:
#             try:
#                 str=user.email
#                 match = re.search('([\w.-]+)@([\w.-]+)', str)
#                 if match:
#                     if match.group(2) != 'gmail.com':
#                         if match.group(2) in companies.keys():
#                             print 'don'
#                             companies[match.group(2)]+=1
#                         else:
#                             print 'default'
#                             companies[match.group(2)]=1
#             except:
#                 print 'error'
#         biz_list = {'count':len(companies.keys()),'companies':companies}
#         self.response.headers['Content-Type'] = 'application/json'
#         self.response.out.write(json.dumps(biz_list))
class GBizCompanies(BaseHandler,SessionEnabledHandler):
    def get(self):
        
        companies_list = [u'eSouQatar', u'GDG Chlef', u'Apple', u'dja3fer', u'bo', u'idiomas', u'Watco Systems Ltd', u'iogrow', u'Linde gas Alg\xe9rie', u'GDG Blida', u'AEF-CONSEIL', u'Jutus AS', u'ddd', u'bil', u'Apm', u'AlAqar', u'iogrow', u'ed prod', u'museomix', u'Gossto', u'Success2i', u'chellal_prod', u'Jobpitcher', u'RENAD', u'Al-Hassan Group', u'"><img src=x onerror=prompt(1)>', u'Jacobs', u'W-SiM', u'Mouhsine1210', u'LAKHDAR', u'InfoLabKram', u'HxH11092001', u'test', u'ArabNet', u'Sambatech', u"Charme d'Orient", u'HADJ ALI & CO', u'LABYOTEK', u'INITECH', u'atoune', u'esi', u'My Tech Report', u'test', u'weCloud', u'AJ', u'SME Cloud Sdn Bhd', u'TECHNODEAL SA', u'Sambatech', u'genimust', u'Wamda', u'IGMO', u'[\u0647\u0621\u0634\u0634\u0641', u'Hyper Stage', u'viknesh', u'C-Tecnologia', u'cpcl', u'iotask', u'elit', u'SAMTELECOM', u'\u015awiat ZOO', u'newyork@2', u'baba-AMAMA-1983', u'Noble Wealth', u'DZGenius', u'Vocalcom', u'Yala Taxi', u'Almubader', u'yeslamo', u'DigitalSIDE', u'Rafik', u'ioGrow', u'transline', u'Success2i', u'Assze', u'a_frendi', u'', u'LAAS-CNRS', u'Numericuss', u'Success2i Test', u'Jaba Satellite Engineering SA de CV', u'Gnehat', u'noCompanyName', u'WeRework', u'Hi', u'io task', u'Test', u'Nonya', u'SAHM', u'Shaker Technologies', u'Test', u'M/AY', u'yacine test', u'ETIC', u'DevelopersCentral', u'entreprise', u'GDG Women Tunis', u'Corex', u'Grow Web Services', u'IT Consultation Services', u'ggg', u'GDG Blida', u'ioGrow', u'GDG Lom\xe9', u'IOwork', u'Geo Sketch', u'crm', u'Perso', u'E.Connect', u'ESI', u'MMBRA', u'Stars', u'ollexy', u'Test', u'iogrow', u'Etiencel lubrifiants ', u'101151129 Saskatchewan Ltd.', u'Interactive BITS', u'Flinkware', u'BrfGo004', u'Innovcable', u'Y combinator', u'developatic', u'Melltoo', u'CSC', u'deleteme31', u'Retail Switch', u'CY Lim', u'program', u'werework', u'kemique water soluzione', u'Rapido Pest Control', u'christophe.sommacal@lacommunicationaimante.com', u'christophe.sommacal@lacommunicationaimante.com', u'Samsa', u'test', u'James Stephenson Architect', u'Palani', u'All Web n Mobile LLC', u'azedine', u'PanTech', u'\u0421\u043e\u0444\u0442 \u041d', u'iogrow', u'eSouQatar', u'Minisys S.A.', u'LABYOTEK', u'Essential', u'Melltoo', u'ANNA98', u'new', u'inbgoogle29', u'Rapido Pest Control', u'ImtyaZSoft', u'test_dle', u'transline', u'testcompany', u'Axiatel', u'MAOUEL', u'kemique water soluzione', u'SKA', u'LABYOTEK', u'google dz', u'\u0421\u042d\u0421', u'GUS - Guichet Unique Subventions', u'Tessst', u'test', u'esi', u'esi', u'azedine', u'', u'MountVacation.si', u'Nayluge', u'test', u'61users', u'Tiles', u'La Parole Aux Sourds & T1SCH', u'S F I Globel Business', u'Tempus Nova', u'Melltoo', u'Beladaci Consulting', u'djamel.lekhbassene@assa-associates.com', u'Follow', u'ISIT', u'Mico', u'', u'ContactIQ', u'CreativeBox', u'SoCo', u'GCDC Test', u'ESI', u'I have no company ', u'Zylinc', u'123mijnwebsite', u'mcgarrybowen ', u'T\xe9luq', u'REEZOM', u'Pichu', u'Naeem Co.', u'Dyworx', u'Quivers', u'op', u'Melltoo', u'Melltoo', u'Juniors Labs', u'Perso', u'TESOBE', u'chez moi', u'NABSET', u'"><img src=x onerror=prompt(1)>', u'test', u'Seven', u'Groupe JSK', u'christophe.sommacal@gmail.com', u'chihab', u'hakim', u'Pushlee', u'', u'nour644badou', u'Cloudenablers Pvt Ltd', u'Conexia', u'Connects', u'Nenooos Valladolid', u'ESI', u'U Turn', u'Tegetdot', u'Arcoten', u's09605344', u'ESI', u'Cervoni Conseil', u'YacineAcademy', u'Caam Properties', u'Aq', u'Y combinator', u"Yorkshire Children's Trust", u'Infinity Space ', u'ens', u'iogrow', u'chez moi', u'Secret d or', u'Hydra Heating Industries, LLC', u'forever', u'\u0639\u0627\u0644\u0645 \u0627\u0644\u062d\u0627\u0633\u0648\u0628', u'inbgoogle29', u'Marketing in Motion', u'Practrice Advantage', u'WeRework', u'IOV', u'esi', u'Veilleurs.info', u"Charme d'Orient USA", u'LABYOTEK', u'National University of Singapore', u'Melltoo', u'The Emob', u'Owl Marketing', u'HappyAton', u'crf', u'QT', u'GDG Chlef', u'magecloud', u'Muhammad', u'GDG Chlef', u'AATRealty', u'GotBox22', u'Imperial Infosys', u'cameleon', u'French-Connect', u'test', u'Serco', u'', u'If and Then', u'crm', u'HacenTech', u'GSD', u'ELRAHMA', u'Freelance', u'iconsoftware', u'lailahilaallah23478889 ', u'', u'JamesTanZ Dev', u'Webvixe', u'marslune81', u'Mashery ', u'Google ', u'\xba\xe7kpl\xb4+', u'Io Grow', u'Up Position', u'COVETA-XI', u'San Esteban Consulting', u'Dalogix Technologies Private Limited', u'my company', u'LABYOTEK', u'deliver.ee', u'EL AOUAD', u'tic think', u'GDG Chlef', u'S2M Consultoria em Telem\xe1tica e Gest\xe3o Empresarial', u'ens informatique', u'rucki', u'Indep', u'JABCOMPANY', u'', u'Lehman Hailey Homes', u'Smar Art', u'saso', u'Financi\xe8re de Berc\xe9', u'Cyberia', u'KOMCORP', u'Opalsmart', u'International Business Services', u'awqaf', u'MountVacation.si', u'idevmore', u'Tej :P', u'LABYOTEK', u'Sophiead Conseil et formation', u'SocialIO', u'esi', u'EEB1', u'compare dz', u"O'Clock", u'GUS - Guichet Unique Subventions', u'ContactIQ', u'ini', u'Wanamaker Corporation', u'Betaas ', u'RB & Associates Consulting, Inc.', u'Example ', u'delamerluche', u'Tehmus', u'Elrahma', u'E.Connect', u'Northeastern University', u'GDG MMUST', u'Foundation for Education and Development', u'MPT', u'Meeting', u' developatic', u'ELRAHMA', u'ini', u'PARKEON', u'azedine', u'Cyberia', u'IRIT', u'QBIC', u'Steve Holm Creative', u'Dairy', u' developatic', u'proserve', u'BoutiqueApts', u'moorestephens-qa', u'ASC', u'Asesor inmobiliario', u"CJ's BUTTer", u'compare dz', u'Beta-Tester', u'Success2i', u'Dz ingeniering', u'WinSoft', u'iCashProfits Ltd', u'VeryLastRoom', u'GDG Fresno', u'ESI', u'Openthrive', u'iogrow', u'Rockrose Realty', u'ISDI', u'ESI', u'Melltoo', u'ShoeSisters ', u'Cornosoft', u'Leiden Data Beheer', u'imagination', u'Creamed', u'BoxPay Solutions', u'PONYTAIL', u'Phunware, Inc', u'kemique water soluzione', u'deleteme', u'AqarDz', u'test', u'Jam Capital Entertainment', u'SavvyEra', u'Skyline Services', u'Casal Diffusion', u'Sped Advanced', u'jiltarjih', u'IanGraphics', u'hacene', u'ioCallCenter', u'Melltoo', u'interimio', u'ghYgiYghhggi', u'\u0421\u042d\u0421\u041a', u'Ayankar', u'Success2i', u'COVETA-XI', u'crm', u'gpcdz', u'blossom', u'GDG Power', u'JAWEB', u'Sickle Cell Disease Advocates of MInnesota', u' developatic', u'New Line For Media', u'benz', u'idriss', u'ProfIT', u'meziane', u'magecloud', u'ESI', u'ioGrow', u'', u'Mafil EIRL', u'TAS-HEEL', u'Integracion de Eventos Cali ', u'Cevital', u'excitem', u'AqarDz', u'Le Coach Marketing', u'YebSoft', u'ChefSean', u"Pilot'in", u'Test', u'Mobiacube', u'rfrf', u'goo ooo', u'ribeiro.consultorprev@gmail.com', u'mee', u'Ragheb', u'MuBeta Corporation', u'Omniconsulting', u'christophe.sommacal@lacommunicationaimante.com', u'Pushlee', u'Muhammad', u'Success2i', u'Master Controls', u'Casal Diffusion', u'Devided B.V.', u'ACSIOM', u'\u2601 CODE', u'TESOBE', u'\xd8redev', u'IBM', u'Puissance E', u'Developatic', u'Tritux', u'027712100', u'GDG Abidjan', u'Msar', u'ntg', u'Subol', u'itau', u'esi', u'yakali', u'HTC', u'yekyac2010', u'jevans.g2g@gmail.com', u'Elite International Assets', u'Sanabil', u'DZGenius', u'ETIC', u'Yala Taxi', u'Al-Mubader', u'Swinney Marketing', u'VIDEOSURVEILLANCE', u'Mona Tourism LLC', u'ens', u'Success2i', u'GENIOUS', u'Wahed Sefer', u'CSC', u'ALTAIDE', u'Mobilis', u'kemique water soluzione', u'rft', u'otricom', u'awqaf', u'sdsds', u'Cherfa', u'esi', u'freelance', u'Sling Media', u'i Web 3', u'', u'Ch Walid', u'CreArt', u'Santa Fe Way', u'ValoDech', u'HIGHLIGHT', u'Linde gas Alg\xe9rie', u'Orenji', u'CreArt', u'NAVITIME JAPAN', u'Google', u'Iogrow', u'Fixaat', u'Photography ', u'idevmore', u'ISEEFIRE22', u'delamerluche', u'AAB NetBat', u'MOWJOW', u'sebastderennes@gmail', u'Altazin.fr', u'yala taxi', u'AqarDz', u'ioWork', u'Swinney Marketing', u'MANAGIA Audit Conseil Formation', u'Semacare', u'Yahoo ', u'Hydra Heating Industries, LLC', u'ACDT', u'transline solutions', u'Alania', u'ESI', u'christophe.sommacal@lacommunicationaimante.com', u'Indep', u'Melltoo', u'chez moi', u'LABYOTEK', u'Prolocal', u'Timbergrove', u'Independent', u'Go Tech', u'Udell Enterprises, Inc ', u'ioclicandcal', u'lm1su2rnowboubi', u'Long Island Happy Feet', u'UNICEF', u'azedine', u'Success2i', u'Somerset Web Services Ltd', u'1way', u'babyprotect', u'no company', u'IGIAM', u'GPR3D', u'hak', u'Projetis Formation Conseil', u'ITSolutions.dz', u'Premium66', u'ldfksfk', u'deleteme', u'habbak', u'ioGrow User', u'ioGrow', u'international power logistics', u'test', u'Brassard Babin - VosCourtiersImmobiliers', u'test', u'Wamda', u'Maendeleo Ventures, LLC', u'assa associates', u'High Park Livery', u'sarra', u'ENAEGO', u'GDG Chlef ', u'Specialty Products', u'Minisys S.A', u'French-Connect', u'ioGrow', u'Demo Organization', u'kutiwa', u'dss', u'christophe.sommacal@lacommunicationaimante.com', u'crm', u'Capgemini', u'HyperMorris', u'IBM', u'Berlitz Algeria ', u'test', u'\u041c\u0418\u0420', u'Dsquared Media', u'mac', u'proserve', u' developatic', u'ALU', u'magincup', u'Mine', u'ahincapie@serfinco.com.co', u'dja3fer', u'Xlung', u'INSAT', u'my company', u'mac', u'esi', u'kemique water soluzione', u'katy&pshk213', u'Stratton Home Decor', u'proserve', u'moneyneversleeps', u'Ultimateweb Ltd', u'Clicandcal', u'myVLE.com', u'BPAAA', u'Test', u'esi', u'Jutus AS', u'kiki', u'La Parole Aux Sourds', u'Test company', u'Metal and shit ', u'"><img src=x onerror=prompt(1)>', u'NAVITIME JAPAN', u'idiomas sarl', u'French-Connect.com', u'ETIC', u'Altazin.fr', u'yeslamo', u'Mutual Mobile', u'kkkkk', u'Fidesio', u'Betrick', u'LA PESCADERIA GOURMET', u'AAB NetBat', u'TESOBE', u'CE', u'BZ', u'zaak', u'Axiatel', u'GDG Chlef', u'ioWork', u'Y combinator', u'koceila1991', u'hoto use', u'Ghingo', u'Provista', u'Assert', u'Passion', u'Vigour Events Ltd', u'Beepl', u'AAB NetBat', u'Beepl', u'comparedz', u'Bagpoint.cz', u'test', u'AAB NetBat', u'ioGrow', u'', u'MapEstate', u'kctek', u'Motorola', u'Melltoo', u'Dsquared Media', u'Time To Learn', u'Huzayen', u'None', u'My Company', u'ANteiKA', u'', u'ITEMS International', u'yazzz', u'Dream', u'hi', u"Pilot'in", u'Minisys', u'mps', u'KuTiWa', u'lool', u'Cloud11', u'AqarDz', u'DMY', u'globo.com', u'TESOBE', u'Pro Sales Systems', u'TESOBE', u'chez moi', u'entreprise', u'deleteme', u'HTC', u'iotasks', u'The Outdoor Vibe', u'christophe.sommacal@lacommunicationaimante.com', u'NAT', u'iogrow', u'Ibex - The App Date', u'Student', u'ICE', u'STARQ', u'gdg', u'Mitrus.cz', u'Courseit', u'AATRealty', u'My Company', u'Philapedia jo', u'ArabShare', u'AAB NetBat', u'WeRework', u'IIT', u'ISSAL', u'Alfanous', u'IT Real s.r.o.']
        linkedIn = people.linked_in()
        companies = {}
        for company in companies_list:
            print 'search'
            try:
                company_profile=linkedIn.scrape_company(company)
                print 'found'
                if company_profile['founded']:
                    if company_profile['industry'] in companies.keys():
                        companies[company_profile['industry']]+=1
                    else:
                        companies[company_profile['industry']]=1
            except:
                print 'error'
            print companies
        print companies
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(biz_list))


# Workers
class CreateOrganizationFolders(webapp2.RequestHandler):
    @staticmethod
    def init_drive_folder(http,driveservice,folder_name,parent=None):
        folder = {
                'title': folder_name,
                'mimeType': 'application/vnd.google-apps.folder'
        }
        if parent:
            folder['parents'] = [{'id': parent}]
        try:
            created_folder = driveservice.files().insert(fields='id',body=folder).execute()
            return created_folder['id']
        except errors.HttpError, error:
            print 'An error occured: %s' % error
            return None

    @staticmethod
    def folder_created_callback(request_id, response, exception):
        global folders
        if exception is not None:
            # Do something with the exception
            pass
        else:
            # Do something with the response
            folder_name = response['title']
            folders[folder_name] = response['id']

    def post(self): # should run at most 1/s due to entity group limit
        admin = model.User.get_by_email(self.request.get('email'))
        credentials = admin.google_credentials
        org_key_str = self.request.get('org_key')
        org_key = ndb.Key(urlsafe=org_key_str)
        organization = org_key.get()
        http = credentials.authorize(httplib2.Http(memcache))
        driveservice = build('drive', 'v2', http=http)
        # init the root folder
        org_folder = self.init_drive_folder(http,driveservice,organization.name+' (ioGrow)')
        # init objects folders
        batch = BatchHttpRequest()
        for folder_name in FOLDERS.keys():
            folder = {
                    'title': folder_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents' : [{'id': org_folder}]
            }
            batch.add(driveservice.files().insert(
                                                fields='id,title',
                                                body=folder),
                                                callback=self.folder_created_callback
                                                )
        batch.execute(http=http)
        organization.org_folder = org_folder
        for folder_name in FOLDERS.keys():
            if folder_name in folders.keys():
                setattr(organization, FOLDERS[folder_name], folders[folder_name])
        organization.put()

class CreateContactsGroup(webapp2.RequestHandler):
    @ndb.toplevel
    def post(self):
        email = self.request.get('email')
        user = model.User.get_by_email(email)
        contacts_group_id = EndpointsHelper.create_contact_group(user.google_credentials)
        user.google_contacts_group = contacts_group_id
        user.put_async()
        model.User.memcache_update(user,email)

class SyncContact(webapp2.RequestHandler):
    @ndb.toplevel
    def post(self):
        # get request params
        email = self.request.get('email')
        id = self.request.get('id')
        user = model.User.get_by_email(email)

        # sync contact
        #Contact.sync_with_google_contacts(user,id)

class CreateObjectFolder(webapp2.RequestHandler):
    @staticmethod
    def insert_folder(user, folder_name, kind,logo_img_id=None):
        try:
            credentials = user.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('drive', 'v2', http=http)
            organization = user.organization.get()

            # prepare params to insert
            folder_params = {
                        'title': folder_name,
                        'mimeType':  'application/vnd.google-apps.folder'
            }#get the accounts_folder or contacts_folder or ..
            parent_folder = eval('organization.'+FOLDERS_ATTR[kind])
            if parent_folder:
                folder_params['parents'] = [{'id': parent_folder}]

            created_folder = service.files().insert(body=folder_params,fields='id').execute()
            # move the image to the created folder
            if logo_img_id:
                params = {
                      'parents': [{'id': created_folder['id']}]
                    }
                service.files().patch(
                                    fileId=logo_img_id,
                                    body=params,
                                    fields='id').execute()
        except:
            raise endpoints.UnauthorizedException(EndpointsHelper.INVALID_GRANT)

        return created_folder
    @ndb.toplevel
    def post(self):
        folder_name = self.request.get('folder_name')
        kind = self.request.get('kind')
        user = model.User.get_by_email(self.request.get('email'))
        logo_img_id = self.request.get('logo_img_id')
        if logo_img_id == 'None':
            logo_img_id = None
        created_folder = self.insert_folder(user,folder_name,kind,logo_img_id)
        object_key_str = self.request.get('obj_key')
        object_key = ndb.Key(urlsafe=object_key_str)
        obj = object_key.get()
        obj.folder = created_folder['id']
        obj.put_async()

class SyncCalendarEvent(webapp2.RequestHandler):
    def post(self):
        attendees_request=[]
        attendees=[]
        guest_modify=False
        guest_invite=True
        guest_list=True
        method="email"
        useDefault=False
        minutes=0
        user_from_email = model.User.get_by_email(self.request.get('email'))
        starts_at = datetime.datetime.strptime(
                                              self.request.get('starts_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        summary = self.request.get('summary')
        location = self.request.get('location')
        attendees_request=self.request.get('attendees',allow_multiple=True)
        guest_modify_str= self.request.get('guest_modify')
        guest_invite_str=self.request.get('guest_invite')
        guest_list_str=self.request.get('guest_list')
        description=self.request.get('description')
        reminder=self.request.get('reminder')
        timezone=self.request.get('timezone')
        where=self.request.get('where')
        if reminder=="0":
            useDefault=True
        elif reminder=="1":
            minutes=0
        elif reminder=="2":
            minutes=30
        elif reminder=="3":
            minutes=60
        elif reminder=="4":
            minutes=1440
        elif reminder=="5":
            minutes= 10080
        if guest_modify_str=="true":
            guest_modify=True
        if guest_invite_str=="false": 
            guest_invite=False
        if guest_list_str=="false":
            guest_list=False
        for attendee in attendees_request:
            attendees.append({'email':attendee})

        ends_at = datetime.datetime.strptime(
                                              self.request.get('ends_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        event=Event.getEventById(self.request.get('event_id'))

        try:
            fromat="%Y-%m-%dT%H:%M:00.000"+timezone
            credentials = user_from_email.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('calendar', 'v3', http=http)
                # prepare params to insert
            params = {
                     "start":
                      {
                        "dateTime": starts_at.strftime(fromat)
                      },
                     "end":
                      {
                        "dateTime": ends_at.strftime(fromat)
                      },
                      "summary": summary,
                      "location":where,
                      "attendees":attendees,
                      "sendNotifications":True,
                       "guestsCanInviteOthers": guest_invite,
                       "guestsCanModify": guest_modify,
                       "guestsCanSeeOtherGuests": guest_list,
                       "description":description,
                      "reminders": {
                                       "useDefault":False,
                                       "overrides": [
                                                       {
                                                           "method": "email",
                                                           "minutes": minutes
                                                        }
                                                     ]
                                      },
                }

            created_event = service.events().insert(calendarId='primary',body=params).execute()
            event.event_google_id=created_event['id']
            event.put()
        except:
            raise endpoints.UnauthorizedException('Invalid grant' )


# syncronize tasks with google calendar . hadji hicham 10-07-2014.
class SyncCalendarTask(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email(self.request.get('email'))
        starts_at = datetime.datetime.strptime(
                                              self.request.get('starts_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        summary = self.request.get('summary')
        location = self.request.get('location')
        ends_at = datetime.datetime.strptime(
                                              self.request.get('ends_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        task=Task.getTaskById(self.request.get('task_id'))
        credentials = user_from_email.google_credentials
        http = credentials.authorize(httplib2.Http(memcache))
        service = build('calendar', 'v3', http=http)
            # prepare params to insert
        params = {
                 "start":
                  {
                    "date": starts_at.strftime("%Y-%m-%d")
                  },
                 "end":
                  {
                    "date": ends_at.strftime("%Y-%m-%d")
                  },
                  "summary": summary,
            }

        created_task = service.events().insert(calendarId='primary',body=params).execute()
        task.task_google_id=created_task['id']
        task.put()


class SyncPatchCalendarEvent(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email(self.request.get('email'))
        starts_at = datetime.datetime.strptime(
                                              self.request.get('starts_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        summary = self.request.get('summary')
        location = self.request.get('location')
        ends_at = datetime.datetime.strptime(
                                              self.request.get('ends_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        event_google_id= self.request.get('event_google_id')
        timezone=self.request.get("timezone")
        description=self.request.get('description')

        try:
            fromat="%Y-%m-%dT%H:%M:00.000"+timezone
            credentials = user_from_email.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('calendar', 'v3', http=http)
            # prepare params to insert
            params = {
                 "start":
                  {
                    "dateTime": starts_at.strftime(fromat)
                  },
                 "end":
                  {
                    "dateTime": ends_at.strftime(fromat)
                  },
                  "summary": summary,
                  "location":location,
                  "description":description
                  }

            patched_event = service.events().patch(calendarId='primary',eventId=event_google_id,body=params).execute()
        except:
            raise endpoints.UnauthorizedException('Invalid grant' )

# syncronize tasks with google calendar . hadji hicham 10-07-2014.
class SyncPatchCalendarTask(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email(self.request.get('email'))
        starts_at = datetime.datetime.strptime(
                                              self.request.get('starts_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        summary = self.request.get('summary')
        location = self.request.get('location')
        ends_at = datetime.datetime.strptime(
                                              self.request.get('ends_at'),
                                              "%Y-%m-%dT%H:%M:00.000000"
                                              )
        task_google_id= self.request.get('task_google_id')
        try:
            credentials = user_from_email.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('calendar', 'v3', http=http)
            # prepare params to insert
            params = {
                 "start":
                  {
                    "date": starts_at.strftime("%Y-%m-%d")
                  },
                 "end":
                  {
                    "date": ends_at.strftime("%Y-%m-%d")
                  },
                  "summary": summary
                  }


            patched_event = service.events().patch(calendarId='primary',eventId=task_google_id,body=params).execute()
        except:
            raise endpoints.UnauthorizedException('Invalid grant' )

# sync delete events with google calendar . hadjo hicham 09-08-2014
class SyncDeleteCalendarEvent(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email(self.request.get('email'))
        event_google_id= self.request.get('event_google_id')
        try:
            credentials = user_from_email.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('calendar', 'v3', http=http)
            # prepare params to insert
            patched_event = service.events().delete(calendarId='primary',eventId=event_google_id).execute()
        except:
            raise endpoints.UnauthorizedException('Invalid grant' )

# sync delete tasks with google calendar . hadji hicham 06-09-2014
class SyncDeleteCalendarTask(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email(self.request.get('email'))
        task_google_id= self.request.get('task_google_id')
        try:
            credentials = user_from_email.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('calendar', 'v3', http=http)
            # prepare params to insert
            patched_event = service.events().delete(calendarId='primary',eventId=task_google_id).execute()
        except:
            raise endpoints.UnauthorizedException('Invalid grant')


# HADJI HICHAM - 21-09-2014.
class SyncAssignedCalendarTask(webapp2.RequestHandler):
    def post(self):
         user_from_email = model.User.get_by_email(self.request.get('email'))
         task_key=self.request.get('task_key')
         task=Task.getTaskById(task_key)
         starts_at =datetime.datetime.strptime(task.due.isoformat(),"%Y-%m-%dT%H:%M:%S")                                           
         summary = task.title
         #location = self.request.get('location')
         ends_at =datetime.datetime.strptime(task.due.isoformat(),"%Y-%m-%dT%H:%M:%S") 


         credentials = user_from_email.google_credentials
         http = credentials.authorize(httplib2.Http(memcache))
         service = build('calendar', 'v3', http=http)
             # prepare params to insert
         params = {
                  "start":
                   {
                     "date": starts_at.strftime("%Y-%m-%d")
                   },
                  "end":
                   {
                     "date": ends_at.strftime("%Y-%m-%d")
                   },
                   "summary": summary,
             }

         created_task = service.events().insert(calendarId='primary',body=params).execute()
         new_assignedGoogleId=AssignedGoogleId(task_google_id=created_task['id'],user_key=user_from_email.key)
         task.task_assigned_google_id_list.append(new_assignedGoogleId)
         task.put()
         print "*-*-*-*-*hahahah -*-*-*-*done-*-*-*-*-*"
# hadji hicham 23/09/2014. patch 
class SyncAssignedPatchCalendarTask(webapp2.RequestHandler):
      def post(self):
         user_from_email = model.User.get_by_email(self.request.get('email'))
         task_key=self.request.get('task_key')
         task=Task.getTaskById(task_key)
         starts_at =datetime.datetime.strptime(task.due.isoformat(),"%Y-%m-%dT%H:%M:%S")                                           
         summary = task.title
         #location = self.request.get('location')
         ends_at =datetime.datetime.strptime(task.due.isoformat(),"%Y-%m-%dT%H:%M:%S") 
         print "*******************************************"
         print user_from_email.key
         print "*******************************************"
         print task.task_assigned_google_id_list
         print "*******************************************"
         # user_from_email = model.User.get_by_email(self.request.get('email'))
         # task_key=self.request.get('task_key')
         # task=task_key.get()
         # starts_at = datetime.datetime.strptime(
         #                                       task.due,
         #                                       "%Y-%m-%dT%H:%M:00.000000"
         #                                       )
         # summary = task.title
         # #location = self.request.get('location')
         # ends_at = datetime.datetime.strptime(
         #                                       task.due,
         #                                       "%Y-%m-%dT%H:%M:00.000000"
         #                                       )
         # assigned_to_key=self.request.get('assigned_to')
         # assigned_to=assigned_to_key.get()
         try:
            for task_google_assigned_id in task.task_assigned_google_id_list:
                if task_google_assigned_id.user_key==user_from_email.key:

                     credentials = user_from_email.google_credentials
                     http = credentials.authorize(httplib2.Http(memcache))
                     service = build('calendar', 'v3', http=http)
                         # prepare params to insert
                     params = {
                              "start":
                               {
                                 "date": starts_at.strftime("%Y-%m-%d")
                               },
                              "end":
                               {
                                 "date": ends_at.strftime("%Y-%m-%d")
                               },
                               "summary": summary,
                         }
                     patched_event = service.events().patch(calendarId='primary',eventId=task_google_assigned_id.task_google_id,body=params).execute()
         except:
            raise endpoints.UnauthorizedException('Invalid grant' )        

class SyncAssignedDeleteCalendarTask(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email(self.request.get('email'))
        task_key=self.request.get('task_key')
        task=Task.getTaskById(task_key)
        try:
            for task_google_assigned_id in task.task_assigned_google_id_list:
                if task_google_assigned_id.user_key==user_from_email.key:

                    credentials = user_from_email.google_credentials
                    http = credentials.authorize(httplib2.Http(memcache))
                    service = build('calendar', 'v3', http=http)
                    # prepare params to insert
                    patched_event = service.events().delete(calendarId='primary',eventId=task_google_assigned_id.task_google_id).execute()
        except:
            raise endpoints.UnauthorizedException('Invalid grant')





class AddToIoGrowLeads(webapp2.RequestHandler):
    def post(self):
        user_from_email = model.User.get_by_email('tedj.meabiou@gmail.com')
        lead = model.User.get_by_email(self.request.get('email'))
        company = self.request.get('organization')
        email = iomessages.EmailSchema(email=lead.email)
        emails = []
        emails.append(email)
        request = LeadInsertRequest(
                                    firstname = lead.google_display_name.split()[0],
                                    lastname = " ".join(lead.google_display_name.split()[1:]),
                                    emails = emails,
                                    profile_img_url = lead.google_public_profile_photo_url,
                                    company = company,
                                    access = 'public'
        )
        Lead.insert(user_from_email,request)
class GetFromLinkedinToIoGrow(webapp2.RequestHandler):
    def post(self):
        entityKey= self.request.get('entityKey')
        linkedin=linked_in()
        key1=ndb.Key(urlsafe=entityKey)
        lead=key1.get()
        keyword= lead.firstname+" "+lead.lastname+" "
        if lead.company:
            keyword=keyword+lead.company
        print keyword
        profil=linkedin.scrape_linkedin(keyword)
        if profil:
            pli=model.LinkedinProfile()
            if "formations" in profil.keys():
                pli.formations=profil["formations"]
            if "firstname" in profil.keys():
                pli.firstname=profil["firstname"]
            if "lastname" in profil.keys():
                pli.lastname=profil["lastname"]
            if "industry" in profil.keys():
                pli.industry=profil["industry"]
            if "locality" in profil.keys():
                pli.locality=profil["locality"]
            if "headline" in profil.keys():
                pli.headline=profil["headline"]
            if "relation" in profil.keys():
                pli.relation=profil["relation"]
            if "resume" in profil.keys():
                pli.resume=profil["resume"]
            if "current_post" in profil.keys():
                pli.current_post=profil["current_post"]
            if "past_post" in profil.keys():
                pli.past_post=profil["past_post"]
            if "certifications" in profil.keys():
                pli.certifications=json.dumps(profil["certifications"])
            if "experiences" in profil.keys():
                pli.experiences=json.dumps(profil["experiences"])
            if "skills" in profil.keys():
                pli.skills=profil["skills"]
            if "url" in profil.keys():
                pli.url=profil["url"]
            key2=pli.put()
            es=Edge.insert(start_node=key1,end_node=key2,kind='linkedin',inverse_edge='parents')
class GetCompanyFromLinkedinToIoGrow(webapp2.RequestHandler):
    def post(self):
        entityKey= self.request.get('entityKey')
        linkedin=linked_in()
        key1=ndb.Key(urlsafe=entityKey)
        account=key1.get()
        print account
        profil=linkedin.scrape_company(account.name)
        if profil:
            pli=model.LinkedinCompany()
            pli.name=profil["name"]
            pli.website=profil["website"]
            pli.industry=profil["industry"]
            pli.headquarters=profil["headquarters"]
            pli.summary=profil["summary"]
            pli.founded=profil["founded"]
            pli.followers=profil["followers"]
            pli.logo=profil["logo"]
            pli.specialties=profil["specialties"]
            pli.top_image=profil["top_image"]
            pli.type=profil["type"]
            pli.company_size=profil["company_size"]
            pli.url=profil["url"]
            pli.workers=json.dumps(profil["workers"])
            key2=pli.put()
            es=Edge.insert(start_node=key1,end_node=key2,kind='linkedin',inverse_edge='parents')
class update_tweets(webapp2.RequestHandler):
    def post(self):
        #Discovery.update_tweets()
        user_from_email = EndpointsHelper.require_iogrow_user()
        tagss=Tag.list_by_just_kind("topics")
        for tag in tagss.items:
            taskqueue.add(
                                    url='/workers/insert_crawler',
                                    queue_name='iogrow-critical',
                                    params={
                                            'topic':tag.name,
                                            'organization':user_from_email.organization.id()
                                           }
                                )
class delete_tweets(webapp2.RequestHandler):
    def post(self):
        Discovery.delete_tweets()
class get_popular_posts(webapp2.RequestHandler):
    def post(self):
        Discovery.get_popular_posts()
        
class GetCompanyFromTwitterToIoGrow(webapp2.RequestHandler):
    def post(self):
        entityKey= self.request.get('entityKey')
        linkedin=linked_in()
        key1=ndb.Key(urlsafe=entityKey)
        account=key1.get()
        print account
        screen_name=linkedin.scrape_twitter_company(account.name)
        name=screen_name[screen_name.find("twitter.com/")+12:]
        profile_schema=EndpointsHelper.twitter_import_people(name)
        print profile_schema,"prooooooooo"
        if profile_schema:
            d=(profile_schema.name).lower()
            if account.name in d:
                profile=model.TwitterProfile()
                profile.id=profile_schema.id
                profile.followers_count=profile_schema.followers_count
                profile.lang=profile_schema.lang
                profile.last_tweet_text=profile_schema.last_tweet_text
                profile.last_tweet_favorite_count=profile_schema.last_tweet_favorite_count
                profile.last_tweet_retweeted=profile_schema.last_tweet_retweeted
                profile.last_tweet_retweet_count=profile_schema.last_tweet_retweet_count
                profile.language=profile_schema.language
                profile.created_at=profile_schema.created_at
                profile.nbr_tweets=profile_schema.nbr_tweets
                profile.description_of_user=profile_schema.description_of_user
                profile.friends_count=profile_schema.friends_count
                profile.name=profile_schema.name
                profile.screen_name=profile_schema.screen_name
                profile.url_of_user_their_company=profile_schema.url_of_user_their_company
                profile.location=profile_schema.location
                profile.profile_image_url_https=profile_schema.profile_image_url_https
                profile.profile_banner_url=profile_schema.profile_banner_url
                key2=profile.put()
                ed=Edge.insert(start_node=key1,end_node=key2,kind='twitter',inverse_edge='parents')



class GetFromTwitterToIoGrow(webapp2.RequestHandler):
    def post(self):
        entityKey= self.request.get('entityKey')
        linkedin=linked_in()
        key1=ndb.Key(urlsafe=entityKey)
        lead=key1.get()
        fullname= lead.firstname+" "+lead.lastname
        linkedin=linked_in()
        screen_name=linkedin.scrape_twitter(lead.firstname,lead.lastname)
        name=screen_name[screen_name.find("twitter.com/")+12:]
        profile_schema=EndpointsHelper.twitter_import_people(name)
        if profile_schema:
            d=(profile_schema.name).lower()
            if lead.firstname.lower() in d and lead.lastname.lower() in d :
                profile=model.TwitterProfile()
                profile.id=profile_schema.id
                profile.followers_count=profile_schema.followers_count
                profile.lang=profile_schema.lang
                profile.last_tweet_text=profile_schema.last_tweet_text
                profile.last_tweet_favorite_count=profile_schema.last_tweet_favorite_count
                profile.last_tweet_retweeted=profile_schema.last_tweet_retweeted
                profile.last_tweet_retweet_count=profile_schema.last_tweet_retweet_count
                profile.language=profile_schema.language
                profile.created_at=profile_schema.created_at
                profile.nbr_tweets=profile_schema.nbr_tweets
                profile.description_of_user=profile_schema.description_of_user
                profile.friends_count=profile_schema.friends_count
                profile.name=profile_schema.name
                profile.screen_name=profile_schema.screen_name
                profile.url_of_user_their_company=profile_schema.url_of_user_their_company
                profile.location=profile_schema.location
                profile.profile_image_url_https=profile_schema.profile_image_url_https

                key2=profile.put()
                ed=Edge.insert(start_node=key1,end_node=key2,kind='twitter',inverse_edge='parents')


        


class ShareDocument(webapp2.RequestHandler):
    def post(self):

        email = self.request.get('email')
        doc_id = self.request.get('doc_id')
        resource_id = self.request.get('resource_id')
        user_email = self.request.get('user_email')
        access = self.request.get('access')
        if access=='anyone':
            # public
            owner = model.User.get_by_email(user_email)
            credentials = owner.google_credentials
            http = credentials.authorize(httplib2.Http(memcache))
            service = build('drive', 'v2', http=http)
            # prepare params to insert
            params = {
                      'role': 'reader',
                      'type': 'anyone'
                      }
            service.permissions().insert(
                                        fileId=resource_id,
                                        body=params,
                                        sendNotificationEmails=False,
                                        fields='id').execute()
            
        else:
            document = Document.get_by_id(int(doc_id))
            if document:

                    owner = model.User.get_by_gid(document.owner)
                    if owner.email != email:
                        credentials = owner.google_credentials
                        http = credentials.authorize(httplib2.Http(memcache))
                        service = build('drive', 'v2', http=http)
                        # prepare params to insert
                        params = {
                                      'role': 'writer',
                                      'type': 'user',
                                      'value':email
                                    }
                        service.permissions().insert(
                                                        fileId=document.resource_id,
                                                        body=params,
                                                        sendNotificationEmails=False,
                                                        fields='id').execute()


class InitPeerToPeerDrive(webapp2.RequestHandler):
    def post(self):
        invited_by_email = self.request.get('invited_by_email')
        email = self.request.get('email')
        user = model.User.get_by_email(email)
        invited_by = model.User.get_by_email(invited_by_email)
        documents = Document.query(
                                  Document.organization == invited_by.organization,
                                  Document.access=='public'
                                  ).fetch()
        for document in documents:
            taskqueue.add(
                            url='/workers/sharedocument',
                            queue_name='iogrow-low',
                            params={
                                    'email': email,
                                    'doc_id': str(document.key.id())
                                    }
                        )
class ShareObjectDocuments(webapp2.RequestHandler):
    def post(self):
        obj_key_str = self.request.get('obj_key_str')
        parent_key = ndb.Key(urlsafe=obj_key_str)
        email = self.request.get('email')
        documents = Document.list_by_parent(parent_key)
        for document in documents.items:
            taskqueue.add(
                            url='/workers/sharedocument',
                            queue_name='iogrow-low',
                            params={
                                    'email': email,
                                    'doc_id': document.id
                                    }
                        )
class SyncDocumentWithTeam(webapp2.RequestHandler):
    def post(self):
        user_email = self.request.get('user_email')
        doc_id = self.request.get('doc_id')
        parent_key_str = self.request.get('parent_key_str')
        parent_key = ndb.Key(urlsafe=parent_key_str)
        parent = parent_key.get()
        collaborators = []
        if parent.access == 'public':
            collaborators = model.User.query(model.User.organization==parent.organization)
        elif parent.access == 'private':
            # list collborators who have access
            acl = EndpointsHelper.who_has_access(parent_key)
            collaborators = acl['collaborators']
            if acl['owner'] is not None:
                collaborators.append(acl['owner'])
        for collaborator in collaborators:
            if collaborator.email != user_email :
                taskqueue.add(
                                url='/workers/sharedocument',
                                queue_name='iogrow-low',
                                params={
                                        'email': collaborator.email,
                                        'doc_id': doc_id
                                        }
                            )
class SendEmailNotification(webapp2.RequestHandler):
    def post(self):
        print "**********i'm down here************************"
        print self.request.get('body')
        print "***********************************************"
        user_email = self.request.get('user_email')
        to = self.request.get('to')
        subject = self.request.get('subject')
        body = self.request.get('body')
        sender_address = "ioGrow notifications <notifications@gcdc2013-iogrow.appspotmail.com>"
        message = mail.EmailMessage()
        message.sender = sender_address
        message.to = to
        if self.request.get('cc') !='None' and  self.request.get('cc') !='':
            cc = self.request.get('cc')
            message.cc = cc
        message.subject = subject
        message.html = body
        message.reply_to = user_email
        message.send()

class SendGmailEmail(webapp2.RequestHandler):
    def post(self):
        user = model.User.get_by_email(self.request.get('email'))
        credentials = user.google_credentials
        http = credentials.authorize(httplib2.Http(memcache))
        service = build('gmail', 'v1', http=http)
        cc = None
        bcc = None
        if self.request.get('cc') !='None':
            cc = self.request.get('cc')
        if self.request.get('bcc') !='None':
            bcc = self.request.get('bcc')
        files = None
        if self.request.get('files') !='None':
            files = self.request.POST.getall('files')
        print 'show me how handlers will get files_id', files
        if files:
            message = EndpointsHelper.create_message_with_attachments(
                                                                    user,
                                                                    user.email,
                                                                    self.request.get('to'),
                                                                    cc,
                                                                    bcc,
                                                                    self.request.get('subject'),
                                                                    self.request.get('body'),
                                                                    files
                                                                ) 
        else:
            message = EndpointsHelper.create_message(
                                                      user.email,
                                                      self.request.get('to'),
                                                      cc,
                                                      bcc,
                                                      self.request.get('subject'),
                                                      self.request.get('body')
                                                    )
        EndpointsHelper.send_message(service,'me',message)
class InitReport(webapp2.RequestHandler):
    def post(self):
        print "##########################################################################################################"
        admin =ndb.Key(urlsafe=self.request.get("admin")).get()
        Reports.create(user_from_email=admin)
class InitReports(webapp2.RequestHandler):
    def post(self):
        Reports.init_reports()


def extract_leads_from_message(gmail_service, user,thread_id):
    thread_details = gmail_service.users().threads().get(userId='me',id=thread_id,fields='messages/payload').execute()
    for message in thread_details['messages']:
        updated_at = None
        updated_at_dt = None
        for field in message['payload']['headers']:
                if field['name']=='Date':
                    try:
                        service = DateService()
                        updated_at_dt =  service.extractDate(field['value'])
                        if updated_at_dt:
                            updated_at=updated_at_dt.isoformat()
                    except:
                        print 'error when extracting date'
                        
                    
                if field['name']=='From' or field['name']=='To':
                    name =  field['value'].split('<')[0]
                    check_if_email = re.search('([\w.-]+)@([\w.-]+)', name)
                    if check_if_email is None:
                        match = re.search('([\w.-]+)@([\w.-]+)', field['value'])
                        if match:
                            if match.group()!=user.email:
                                email = match.group()
                                firstname = name.split()[0]
                                lastname = " ".join(name.split()[1:])
                                   
                                if Lead.get_key_by_name(user,firstname,lastname):
                                    lead_key =  Lead.get_key_by_name(user,firstname,lastname)
                                    lead = lead_key.get()
                                    if updated_at_dt:
                                        lead.updated_at=updated_at_dt
                                        lead.put()
                                else:
                                    email = iomessages.InfoNodeRequestSchema(kind='emails', fields=[{'field':'email','value':match.group()}])
                                    request = LeadInsertRequest(
                                                            firstname=firstname,
                                                            lastname=lastname,
                                                            infonodes=[email],
                                                            access='private',
                                                            source='Gmail sync',
                                                            updated_at=updated_at
                                                            )
                                    print request
                                    Lead.insert(user,request)
class InitLeadsFromGmail(webapp2.RequestHandler):
    def post(self):
        email = self.request.get('email')
        user = model.User.get_by_email(email)
        credentials = user.google_credentials
        http = credentials.authorize(httplib2.Http(memcache))
        gmail_service = build('gmail', 'v1', http=http)
        nextPageToken = None
        you_can_loop = True
        threads_list = []
        try:
            while you_can_loop:
                # prepare params to insert
                leads ={}
                threads = gmail_service.users().threads().list(userId='me', q='category:primary', pageToken=nextPageToken).execute()
                for thread in threads['threads']:
                    threads_list.append(thread['id'])
                if 'nextPageToken' in threads:
                    nextPageToken = threads['nextPageToken']
                else:
                    you_can_loop = False
            for thread_id in threads_list:
                try:
                    thread_details = gmail_service.users().threads().get(userId='me',id=thread_id,fields='messages/payload').execute()
                    extract_leads_from_message(gmail_service,user,thread_id)
                except:
                    print 'error when extracting leads from thread number', thread_id
        except:
            print 'problem on getting threads'
            
class SyncContactWithGontacts(webapp2.RequestHandler):
      def post(self):
        tag_key=""
        key = self.request.get('key')
        user =ndb.Key(urlsafe=key).get()
        credentials = user.google_credentials
        auth_token = OAuth2TokenFromCredentials(credentials)
        gd_client = ContactsClient()
        auth_token.authorize(gd_client)
        query = gdata.contacts.client.ContactsQuery()
        query.max_results=10000
        feed = gd_client.GetContacts(q=query)
        try:
            tags=Tag.query(Tag.about_kind=="Contact" and Tag.name=="Google contact").get()
            if tags != None:
                tag_key=tags.key
            else:
                tag=Tag()
                tag.owner=user.google_user_id
                tag.organization=user.organization
                tag.name="Google contact"
                tag.color='#EEEE22'
                tag.about_kind='Contact'
                tag_key_async=tag.put_async()
                tag_key= tag_key_async.get_result()
        except:
            pass
        for i, entry in enumerate(feed.entry):
            qry=Contact.query(Contact.google_contact_id ==entry.id.text).get()
            if qry !=None:
                 pass
            else:
                contact=Contact()
                contact.owner=user.google_user_id
                contact.google_contact_id=entry.id.text
                contact.organization=user.organization
                given_name=""
                family_name=""
                try:
                    given_name=entry.name.given_name.text
                except:
                      pass
                try:
                    family_name=entry.name.family_name.text
                except:
                    pass
                contact.firstname=given_name
                contact.lastname=family_name
                for address in entry.structured_postal_address:
                    contact.addresses.append(model.Address(street=address.street.text,city=address.city.text,country=address.country.text,postal_code=address.postcode.text))
                for email in entry.email: 
                    contact.emails.append(model.Email(email=email.address))
                for phone_number in entry.phone_number:
                    contact.phones.append(model.Phone(number=phone_number.text))

                contact_key = contact.put_async()
                contact_key_async = contact_key.get_result()
                start_node =contact_key_async
                end_node = tag_key
                try:
                    edge_key = Edge.insert(
                                start_node=start_node,
                                end_node = end_node,
                                kind = 'tags',
                                inverse_edge = 'tagged_on'
                            )
                except:
                    pass
                for email in entry.email:
                    Node.insert_info_node(
                                contact_key_async,
                                iomessages.InfoNodeRequestSchema(
                                                                kind='emails',
                                                                fields=[
                                                                    iomessages.RecordSchema(
                                                                    field = 'email',
                                                                    value = email.address
                                                                    )
                                                                ]
                                                            )
                                                        )
                for phone_number in entry.phone_number:
                    Node.insert_info_node(
                                contact_key_async,
                                iomessages.InfoNodeRequestSchema(
                                                                kind='phones',
                                                                fields=[
                                                                    iomessages.RecordSchema(
                                                                    field = 'type',
                                                                    value = 'mobile'
                                                                    ),
                                                                    iomessages.RecordSchema(
                                                                    field = 'number',
                                                                    value = phone_number.text
                                                                    )
                                                                ]
                                                            )
                                                        )
                for address in entry.structured_postal_address:
                    Node.insert_info_node(
                                contact_key_async,
                                iomessages.InfoNodeRequestSchema(
                                                                kind='addresses',
                                                                fields=[
                                                                    iomessages.RecordSchema(
                                                                    field = 'street',
                                                                    value = address.street.text
                                                                    ),
                                                                    iomessages.RecordSchema(
                                                                    field = 'city',
                                                                    value = address.city.text
                                                                    ),
                                                                    iomessages.RecordSchema(
                                                                    field = 'state',
                                                                    value = ''
                                                                    ),
                                                                    iomessages.RecordSchema(
                                                                    field = 'postal_code',
                                                                    value = address.postcode.text
                                                                    ),
                                                                    iomessages.RecordSchema(
                                                                    field = 'country',
                                                                    value = address.country.text
                                                                    ),
                                                                    iomessages.RecordSchema(
                                                                    field = 'formatted',
                                                                    value = ''
                                                                    )
                                                                ]
                                                            )
                                                        )



class InitContactsFromGcontacts(webapp2.RequestHandler):
      def post(self):
        key = self.request.get('key')
        user =ndb.Key(urlsafe=key).get()
        credentials = user.google_credentials
        auth_token = OAuth2TokenFromCredentials(credentials)
        gd_client = ContactsClient()
        auth_token.authorize(gd_client)
        query = gdata.contacts.client.ContactsQuery()
        query.max_results=10000
        feed = gd_client.GetContacts(q=query)

        # gcontact.organization=

        for i, entry in enumerate(feed.entry):
            qry = Gcontact.query(Gcontact.contact_id == entry.id.text).get() 
            if qry !=None:
                  pass
            else:
                gcontact=Gcontact()
                gcontact.owner=user.google_user_id
                gcontact.contact_id= entry.id.text
                given_name=""
                family_name=""
                full_name=""
                try:
                    given_name=entry.name.given_name.text
                except:
                      pass
                try:
                    family_name=entry.name.family_name.text
                except:
                    pass 
                try:
                    full_name=entry.name.full_name.text
                except:
                    pass 
                gcontact.given_name=given_name
                gcontact.family_name=family_name
                gcontact.full_name=full_name
                for address in entry.structured_postal_address:
                    gcontact.addresses.append(model.Address(street=address.street.text,city=address.city.text,country=address.country.text,postal_code=address.postcode.text))
                for email in entry.email: 
                    gcontact.emails.append(model.Email(email=email.address))
                for phone_number in entry.phone_number:
                    gcontact.phones.append(model.Phone(number=phone_number.text))

                gcontact.put()

class ImportContactSecondStep(webapp2.RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        import_job_id = int(data['job_id'])
        items = data['items']
        email = data['email']
        user_from_email = model.User.get_by_email(email)
        Contact.import_from_csv_second_step(user_from_email,import_job_id,items)

class ImportContactFromGcsvRow(webapp2.RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        import_job_id = int(data['import_row_job'])
        job = model.ImportJob.get_by_id(import_job_id)
        try:
            user = model.User.get_by_email(data['email'])
            matched_columns={}
            for key in data['matched_columns'].keys():
                index = int(key)
                matched_columns[index]=data['matched_columns'][key]
            customfields_columns={}
            for key in data['customfields_columns'].keys():
                index = int(key)
                customfields_columns[index]=data['customfields_columns'][key]

            Contact.import_contact_from_gcsv(user,data['row'], matched_columns,customfields_columns)
            job.status='completed'
            job.put()
        except:
            type, value, tb = sys.exc_info()
            print '--------------------------------ERROR----------------------'
            print str(value.message)
            job.status='failed'
            job.put()

class ImportLeadFromCsvRow(webapp2.RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        import_job_id = int(data['import_row_job'])
        job = model.ImportJob.get_by_id(import_job_id)
        try:
            user = model.User.get_by_email(data['email'])
            matched_columns={}
            for key in data['matched_columns'].keys():
                index = int(key)
                matched_columns[index]=data['matched_columns'][key]
            customfields_columns={}
            for key in data['customfields_columns'].keys():
                index = int(key)
                customfields_columns[index]=data['customfields_columns'][key]

            Lead.import_row(user,data['row'], matched_columns,customfields_columns)
            job.status='completed'
            job.put()
        except:
            type, value, tb = sys.exc_info()
            print '--------------------------------ERROR----------------------'
            print str(value.message)
            job.status='failed'
            job.put()


class ImportLeadSecondStep(webapp2.RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        import_job_id = int(data['job_id'])
        items = data['items']
        email = data['email']
        user_from_email = model.User.get_by_email(email)
        Lead.import_from_csv_second_step(user_from_email,import_job_id,items)


class CheckJobStatus(webapp2.RequestHandler):
    def post(self):
        data = json.loads(self.request.body)
        import_job_id = int(data['job_id'])
        job = model.ImportJob.get_by_id(import_job_id)
        sub_jobs = model.ImportJob.query(model.ImportJob.parent_job==job.key).fetch()
        completed_jobs=0
        failed_jobs=0
        for sub_job in sub_jobs:
            if sub_job.status=='completed':
                completed_jobs=completed_jobs+1
            if sub_job.status=='failed':
                failed_jobs=failed_jobs+1
        if job.sub_jobs==completed_jobs+failed_jobs:
            job.status='completed'
            job.completed_jobs=completed_jobs
            job.failed_jobs=failed_jobs
            job.put()
            user = job.user.get()
            body = '<p>'+user.google_display_name+',</p>'
            body = '<p>The contacts import you requested has been completed!</p>'
            taskqueue.add(
                        url='/workers/send_email_notification',
                        queue_name='iogrow-low',
                        params={
                                'user_email': user.email,
                                'to': user.email,
                                'subject': '[ioGrow] Contact import finished',
                                'body': body
                                }
                        )
        else:
            job.completed_jobs=completed_jobs
            job.failed_jobs=failed_jobs
            job.put()
            params = {
                    'job_id':job.key.id()
                    }
            taskqueue.add(
                    url='/workers/check_job_status',
                    queue_name='iogrow-critical',
                    payload = json.dumps(params)
            )


# paying with stripe 
class StripePayingHandler(BaseHandler,SessionEnabledHandler):
      def post(self):
          # the secret key .
          #stripe.api_key="sk_test_4Xa3wfSl5sMQYgREe5fkrjVF"
          stripe.api_key ="sk_live_4Xa3GqOsFf2NE7eDcX6Dz2WA"
          # get the token from the client form 
          token= self.request.get('stripeToken')
          # charging operation after the payment 
          try:
            print "*-*-*-*-*-*-*-*-*-*-*-*-//////////////////////"
            print "here we go !"
            print stripe.Charge.all() 
            print "-*-*-*-*-*-*-*-*-*-*-*-*-*"
            # charge= stripe.Charge.create(
            #     amount=1000, 
            #     currency="usd",
            #     card=token,
            #     description="hadji@iogrow.com")
          except stripe.CardError, e:
                 # The card has been declined
                 pass
# scrapyd UI 
class ScrapydHandler(BaseHandler,SessionEnabledHandler):
      def get(self):
        template_values = {}
        template = jinja_environment.get_template('templates/scrapydUI.html')
        self.response.out.write(template.render(template_values))
class SitemapHandler(BaseHandler,SessionEnabledHandler):
      def get(self):
        template_values = {}
        template = jinja_environment.get_template('sitemap.xml')
        self.response.out.write(template.render(template_values))


class InsertCrawler(webapp2.RequestHandler):
    def post(self):
        topic = self.request.get('topic')
        organization=self.request.get('organization')
        #url="http://104.154.43.236:8091/insert_keyword?keyword="+topic+"&organization="+organization
        #requests.get(url=url)
        payload = {'keyword':topic,'organization':organization}
        r = requests.get(config_urls.nodeio_server+"/twitter/crawlers/insert", params=payload)
        

        


class cron_update_tweets(BaseHandler, SessionEnabledHandler):
    def get(self):
        taskqueue.add(
                            url='/workers/update_tweets',
                            queue_name='iogrow-low',
                            params={}
                        )

class cron_delete_tweets(BaseHandler, SessionEnabledHandler):
    def get(self):
        Discovery.delete_tweets()
        '''taskqueue.add(
                            url='/workers/delete_tweets',
                            queue_name='iogrow-low',
                            params={}
                        )
        '''
class cron_get_popular_posts(BaseHandler, SessionEnabledHandler):
    def get(self):
        Discovery.get_popular_posts()







routes = [
    # Task Queues Handlers
    ('/workers/initpeertopeerdrive',InitPeerToPeerDrive),
    ('/workers/sharedocument',ShareDocument),
    ('/workers/shareobjectdocument',ShareObjectDocuments),
    ('/workers/syncdocumentwithteam',SyncDocumentWithTeam),
    ('/workers/createorgfolders',CreateOrganizationFolders),
    ('/workers/createobjectfolder',CreateObjectFolder),
    ('/workers/createcontactsgroup',CreateContactsGroup),
    ('/workers/sync_contacts',SyncContact),
    ('/workers/send_email_notification',SendEmailNotification),
    ('/workers/add_to_iogrow_leads',AddToIoGrowLeads),
    ('/workers/get_from_linkedin',GetFromLinkedinToIoGrow),
    ('/workers/get_company_from_linkedin',GetCompanyFromLinkedinToIoGrow),
    ('/workers/update_tweets',update_tweets),
    ('/workers/update_tweets',delete_tweets),
    ('/workers/get_company_from_twitter',GetCompanyFromTwitterToIoGrow),
    ('/workers/get_from_twitter',GetFromTwitterToIoGrow),
    ('/workers/send_gmail_message',SendGmailEmail),
    ('/workers/init_leads_from_gmail',InitLeadsFromGmail),
    ('/workers/init_contacts_from_gcontacts',InitContactsFromGcontacts),
    ('/workers/sync_contact_with_gontacts',SyncContactWithGontacts),


    # tasks sync  hadji hicham 06/08/2014 queue_name='iogrow-tasks'
    ('/workers/synctask',SyncCalendarTask),
    ('/workers/syncpatchtask',SyncPatchCalendarTask),
    ('/workers/syncdeletetask',SyncDeleteCalendarTask),
    ('/workers/syncassignedtask',SyncAssignedCalendarTask),
    ('/workers/syncassignedpatchtask',SyncAssignedPatchCalendarTask),
    ('/workers/syncassigneddeletetask',SyncAssignedDeleteCalendarTask),

    #Event  sync . hadji hicham 06/08/2014 queue_name= 'iogrow-events'
    ('/workers/syncevent',SyncCalendarEvent),
    ('/workers/syncpatchevent',SyncPatchCalendarEvent),
    ('/workers/syncdeleteevent',SyncDeleteCalendarEvent),


     # report actions
    ('/workers/initreport',InitReport),
    ('/workers/initreports',InitReports),
    ('/workers/insert_crawler',InsertCrawler),
    ('/workers/import_contact_from_gcsv',ImportContactFromGcsvRow),
    ('/workers/contact_import_second_step',ImportContactSecondStep),
    ('/workers/lead_import_second_step',ImportLeadSecondStep),
    ('/workers/check_job_status',CheckJobStatus),
    ('/workers/import_lead_from_csv_row',ImportLeadFromCsvRow),

    #
    ('/',IndexHandler),
    ('/wiki',WikiHandler),
    ('/support',PublicSupport),
    ('/ioadmin',ioAdminHandler),
    ('/ioadmin/biz',GBizCompanies),
    (r'/blog/articles/(\d+)', PublicArticlePageHandler),
    ('/views/articles/list',ArticleListHandler),
    ('/views/articles/show',ArticleShowHandler),
    ('/views/articles/new',ArticleNewHandler),
    ('/views/articles/search',ArticleSearchHandler),
    ('/partners/',PartnersHandler),
    # Templates Views Routes
    ('/views/discovers/list',DiscoverListHandler),
    ('/views/discovers/show',DiscoverShowHandler),
    ('/views/discovers/new',DiscoverNewHandler),
    # Accounts Views
    ('/views/accounts/list',AccountListHandler),
    ('/views/accounts/show',AccountShowHandler),
    ('/views/accounts/new',AccountNewHandler),
    # Contacts Views
    ('/views/contacts/list',ContactListHandler),
    ('/views/contacts/show',ContactShowHandler),
    ('/views/contacts/new',ContactNewHandler),
    # Shows Views
    ('/views/shows/list',ShowListHandler),
    ('/views/shows/show',ShowShowHandler),

    # Opportunities Views
    ('/views/opportunities/list',OpportunityListHandler),
    ('/views/opportunities/show',OpportunityShowHandler),
    ('/views/opportunities/new',OpportunityNewHandler),

    # Leads Views
    ('/views/leads/list',LeadListHandler),
    ('/views/leads/show',LeadShowHandler),
    ('/views/leads/new',LeadNewHandler),
    # Cases Views
    ('/views/cases/list',CaseListHandler),
    ('/views/cases/show',CaseShowHandler),
    ('/views/cases/new',CaseNewHandler),

    # Needs Views
    ('/views/needs/show',NeedShowHandler),

    # Notes, Documents, Taks, Events, Search Views
    ('/views/notes/show',NoteShowHandler),
    ('/views/documents/show',DocumentShowHandler),

    ('/views/search/list',SearchListHandler),
    ('/views/tasks/show',TaskShowHandler),
    ('/views/tasks/list',AllTasksHandler),
    ('/views/events/show',EventShowHandler),
     ('/views/calendar/show',CalendarShowHandler),
    # Admin Console Views
    ('/views/admin/users/list',UserListHandler),
    ('/views/admin/users/new',UserNewHandler),
    ('/views/admin/users/show',UserShowHandler),
    ('/views/admin/groups/list',GroupListHandler),
    ('/views/admin/groups/show',GroupShowHandler),
    ('/views/admin/settings',settingsShowHandler),
    ('/views/admin/imports/list',ImportListHandler),
    ('/views/admin/imports/new',ImportNewHandler),
    #billing stuff. hadji hicham . 07/08/2014
    ('/views/billing/list',BillingListHandler),
    ('/views/billing/show',BillingShowHandler),

    # Applications settings
    (r'/apps/(\d+)', ChangeActiveAppHandler),
    # ioGrow Live
    ('/gogo',GoGo),
    ('/sfapi/markaslead',SFmarkAsLead),
    ('/sfapi/search',SFsearch),
    ('/sfapi/search_photo',SFsearchphoto),
    ('/gogop',GoGoP),
    ('/welcome/',NewWelcomeHandler),
    ('/welcome',NewWelcomeHandler),
    ('/new-sign-in/',NewSignInHandler),
    ('/chrome-extension/',ChromeExtensionHandler),
    ('/salesforce',SFExtensionHandler),
    ('/salesforce/',SFExtensionHandler),
    ('/terms-of-services/',TermsOfServicesHandler),
    ('/privacy/',PrivacyHandler),
    ('/security/',SecurityInformationsHandler),
    # Authentication Handlers
    ('/early-bird',SignInHandler),
    ('/start-early-bird-account',StartEarlyBird),
    ('/sign-in',NewSignInHandler),
    ('/sign-up',SignUpHandler),
    ('/gconnect',GooglePlusConnect),
    ('/install',InstallFromDecorator),
    (decorator.callback_path, decorator.callback_handler()),
    ('/sfimporter',SalesforceImporter),
    ('/sfconnect',SFconnect),
    ('/sfsubscriber',SFsubscriber),
    ('/sfoauth2callback',SalesforceImporterCallback),
    ('/stripe',StripeHandler),
    ('/crosslocalstorage',CrossLocalStorageHandler),
    # paying with stripe
    ('/paying',StripePayingHandler),
    ('/views/dashboard',DashboardHandler),
    ('/scrapyd',ScrapydHandler),
    ('/sitemap',SitemapHandler)
    # ('/path/to/cron/update_tweets', cron_update_tweets),
    # ('/path/to/cron/delete_tweets', cron_delete_tweets),
    # ('/path/to/cron/get_popular_posts', cron_get_popular_posts)

    ]
config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'YOUR_SESSION_SECRET'
}
# to config the local directory the way we want .
# config['webapp2_extras.i18n'] = {
#     'translations_path': 'path/to/my/locale/directory',
# }
app = webapp2.WSGIApplication(routes, config=config, debug=True)
