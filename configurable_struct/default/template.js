/*
 This is the signature HTML template.
 It will be wrapped inside "signature" div (in index.html).
 Please, use INLINE CSS to avoid problems with signature

 This template will be parsed using "mustache.js" and values are read from "FORM_FIELDS" (using `name` parameter).

 If you need some "hardcoded" text, you can set up here or in "fields.js".
 If you need dynamic data, you can edit "middleware.js"

 https://github.com/janl/mustache.js/
 */
define(function () {
return `
	<table>
		<tr>
			<td vertical-align="middle" style="padding-right: 15px;">
				<img src="{{#imageURL}}assets/img/logo.png{{/imageURL}}" width="190px" height="170px" />
			</td>
			<td vertical-align="middle">
				<table>
					{{! Company Info }}
					<tr>
						<td colspan="2">
							<span style="font-weight: 700; font-size: 15px;">
								{{ form.name }}
							</span>
						</td>
					</tr>
					
					{{! Professional Category }}
					<tr>
						<td colspan="2" style="padding-bottom: 10px; font-size: 13px;">
							<span style="font-size: 14px;">
								{{ form.professionalCategory }}
							</span>
						</td>
					</tr>
					
					{{! Phone }}
					<tr>
						<td style="padding-right: 10px;">
							<img src="{{#imageURL}}assets/img/icon-phone.png{{/imageURL}}" width="25" height="25" />
						</td>
						<td>
							<span style="font-size: 12px;">
								<a href="tel:{{urlPhone}}">{{form.phone}}</a>
							</span>
						</td>
					</tr>
					
					{{! Mail }}
					{{#form.email}}
					<tr>
						<td style="padding-right: 10px;">
							<img src="{{#imageURL}}assets/img/icon-email.png{{/imageURL}}" width="25" height="25" />
						</td>
						<td>
							<span style="font-size: 12px;">
								<a href="mailto:{{form.email}}">{{form.email}}</a>
							</span>
						</td>
					</tr>
					{{/form.email}}
					
					{{! Web }}
					<tr>
						<td style="padding-right: 10px;">
							<img src="{{#imageURL}}assets/img/icon-web.png{{/imageURL}}" width="25" height="25" />
						</td>
						<td>
							<span style="font-size: 12px;">
								<a href="{{companyInfo.website}}" target="_blank">{{companyInfo.websiteText}}</a>
							</span>
						</td>
					</tr>
					
					{{! Social Networks }}
					<tr>
						<td colspan="2" style="padding-top: 5px;">
							{{#socialNetworks.github}}
							<a href="{{socialNetworks.github}}" target="_blank"><img src="{{#imageURL}}assets/img/icon-github.png{{/imageURL}}" width="{{sizes.socialNetworksIcons}} height="{{sizes.socialNetworksIcons}}" /></a> 
							{{/socialNetworks.github}}

							{{#socialNetworks.facebook}}
							<a href="{{socialNetworks.facebook}}" target="_blank"><img src="{{#imageURL}}assets/img/icon-fb.png{{/imageURL}}" width="{{sizes.socialNetworksIcons}} height="{{sizes.socialNetworksIcons}}" /></a> 
							{{/socialNetworks.facebook}}

							{{#socialNetworks.twitter}}
							<a href="{{socialNetworks.twitter}}" target="_blank"><img src="{{#imageURL}}assets/img/icon-twitter.png{{/imageURL}}" width="{{sizes.socialNetworksIcons}} height="{{sizes.socialNetworksIcons}}" /></a> 
							{{/socialNetworks.twitter}}

							{{#socialNetworks.instagram}}
							<a href="{{socialNetworks.instagram}}" target="_blank"><img src="{{#imageURL}}assets/img/icon-instagram.png{{/imageURL}}" width="{{sizes.socialNetworksIcons}} height="{{sizes.socialNetworksIcons}}" /></a> 
							{{/socialNetworks.instagram}}

							{{#socialNetworks.linkedin}}
							<a href="{{socialNetworks.linkedin}}" target="_blank"><img src="{{#imageURL}}assets/img/icon-linkedin.png{{/imageURL}}" width="{{sizes.socialNetworksIcons}} height="{{sizes.socialNetworksIcons}}" /></a> 
							{{/socialNetworks.linkedin}}
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
	
	{{! Additional Footer Signature }}
	<div style="font-size: 10px; color: rgb(51,51,51);">
		<p>
			Company website: <a href="{{companyInfo.website}}" target="_blank">{{companyInfo.websiteText}}</a>
		</p>
		<p>
			Add here your legal warning.
		</p>
		<p>
			{{companyInfo.name}}, 
			{{companyInfo.direction.street}} &middot; 
			{{companyInfo.direction.city}} &middot; 
			{{companyInfo.direction.postalCode}} &middot; 
			{{companyInfo.direction.province}}
		</p>
	</div>
`;
});