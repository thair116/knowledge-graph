import json
import requests


NEPTUNE_URL = 'https://harmonic-instance-1.cbycqrjfsmkf.us-west-2.neptune.amazonaws.com:8182/gremlin'


# This is the entry point for the Lambda function
def handler(event, context):
  print(f'received event: {event}')
  # retrieve the body of the request
  try:
    body = json.loads(event['body'])
  except Exception as error: # could throw keyError or JSONDecodeError
    print(f"Missing or malformatted body': {error}") 
    return {
        'statusCode': 400,
    }
  
  return process_body(body)
  

# This function processes the body of the request
def process_body(parsedBody):
  # retrieve the fileContents from the body
  try:
    rows = json.loads(parsedBody['fileContents'])
  except Exception as error: # could throw keyError or JSONDecodeError
    print(f"Missing or malformatted fileContents': {error}") 
    return {
        'statusCode': 400,
    }
  
  # process the rows into inserts 
  inserts = [process_row(row) for row in rows]

  for insert in inserts:
    send_to_neptune(insert)
  
  return {
      'statusCode': 200,
      'headers': {
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
      },
      'body': json.dumps('Successful load')
  }


# This function sends the insert to Neptune
def send_to_neptune(insert):
    headers = {
        'Content-Type': 'application/json'
    }
    body = {
        'gremlin': insert,
    }

    try:
        payload = json.dumps(body)
        response = requests.post(NEPTUNE_URL, headers=headers, data=payload)
        response_json = response.json()

        if response.status_code == 200:
            print({'success': 'post call succeed!', 'body': response_json})
        else:
            print({'statusCode': response.status_code, 'body': response.text})
    except Exception as error:
        print(f"Error: {error}")


# This function processes a row of the input file, mapping it to the correct processing function for its type
def process_row(row):
   if row.get('company_name') is not None:
      return process_company(row)
   elif row.get('employment_title') is not None:
      return process_employee(row)
   elif row.get('parent_company_id') is not None:
      return process_merger(row)


def process_company(entry):
    company_id = entry['company_id']
    company_name = entry['company_name']
    headcount = entry['headcount'] or '-1' # default to -1 if headcount is not provided

    # add a company vertex
    command = f"""
    g.addV('company').
      property('company_id', {company_id}).
      property('company_name', "{company_name}").
      property('headcount', {headcount}).
      next()"""
    return command


def process_employee(entry):
  person_id = entry['person_id']
  company_id = entry['company_id']
  employment_title = entry['employment_title'].replace("'", "\\'")  # Escape single quotes
  start_date = entry['start_date']
  end_date = entry.get('end_date')

  # add a person vertex if it doesn't exist
  command = f"""
  g.V().
    hasLabel('person').
    has('person_id', {person_id}).
    fold()
    .coalesce(
        unfold(),
        addV('person').property('person_id', {person_id})
      ).
    next()
  """

  # add an edge between the person and company
  command += f"""
  g.V().
    has('person', 'person_id', {person_id}).as('p').
  V().
    has('company', 'company_id', {company_id}).as('c').
    addE('employed_at').
      from('p').
      to('c').
      property('employment_title', '{employment_title}')
  """

  if start_date:
      command += f".property('start_date', '{start_date}')"
  if end_date:
      command += f".property('end_date', '{end_date}')"

  command += ".next();"
  return command


def process_merger(entry):
    parent_company_id = entry['parent_company_id']
    acquired_company_id = entry['acquired_company_id']
    merged_into_parent_company = entry['merged_into_parent_company']

    # add an edge between the parent company and the acquired company
    command = f"""
    g.V().
      has('company', 'company_id', {parent_company_id}).as('a').
    V().
      has('company', 'company_id', {acquired_company_id}).as('b').
      addE('acquired').
        from('a').
        to('b').
        property('wasMerger', '{merged_into_parent_company}').
      next()
    """
    return command